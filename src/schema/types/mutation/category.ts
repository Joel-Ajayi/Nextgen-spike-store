import { mutationField, nonNull, stringArg } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { CategoryMiniObj } from "../objects";
import { validator } from "../../../helpers/validator";
import { GraphQLError } from "graphql";
import { CategoryInput, CategoryUpdateInput } from "../inputs";
import { CategoryType } from "@prisma/client";
import { cloneDeep } from "lodash";
import { CONST } from "../../../@types/conts";

export const CreateCategory = mutationField("CreateCategory", {
  type: CategoryMiniObj,
  args: { data: CategoryInput },
  resolve: async (_, { data }, ctx) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.category(data as any);

    // check if already added
    const addedCat = await ctx.db.category.findUnique({
      where: { name: data?.name },
      select: { id: true },
    });
    if (addedCat) {
      throw new GraphQLError("Category already added", {
        extensions: { statusCode: 400 },
      });
    }

    // check parent
    let parent: {
      type: CategoryType;
      id: string;
    } | null = null;
    if (data?.parent) {
      parent = await ctx.db.category.findUnique({
        where: { name: data.parent },
        select: { id: true, type: true },
      });
      if (!parent) {
        throw new GraphQLError("Parent category does not exist", {
          extensions: { statusCode: 404 },
        });
      }
    }

    // validate image/
    const imgLink =
      (await validator.files(!!data?.image ? [data?.image] : [], 1, 0))[0] ||
      "";
    const bannerLinks = await validator.files(data?.banners as any, 3, 0);

    // category type
    let type: CategoryType = CategoryType.SuperOrd;
    if (!!parent) {
      if (parent.type === CategoryType.SubOrd) {
        throw new GraphQLError("Sorry, you can't add to this category", {
          extensions: { statusCode: 400 },
        });
      }
      type =
        parent.type === CategoryType.SuperOrd
          ? CategoryType.Basic
          : CategoryType.SubOrd;
    }

    let newCat: {
      type: CategoryType;
      name: string;
      id: string;
      parent: {
        name: string;
      };
    } = null as any;
    try {
      // add category
      newCat = (await ctx.db.category.create({
        data: {
          name: data.name,
          type,
          description: data.description,
          image: imgLink,
          banners: bannerLinks,
          parentId: !parent?.id ? undefined : parent.id,
        },
        select: {
          id: true,
          name: true,
          type: true,
          parent: {
            select: {
              name: true,
            },
          },
        },
      })) as any;
    } catch (error) {
      throw new GraphQLError(CONST.errors.server, {
        extensions: { statusCode: 500 },
      });
    }

    if (!newCat) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    if (type === CategoryType.Basic && data.filters.length) {
      // add category filters
      const filterIds: string[] = [];
      if (data.filters?.length) {
        await Promise.all(
          data.filters.map(async ({ name, options, unit, type }) => {
            const filter = await ctx.db.catFilter.create({
              data: { name, options, unit, type, categoryId: newCat.id },
            });
            filterIds.push(filter.id);
          })
        );
      }

      await ctx.db.category.update({
        where: { id: newCat.id },
        data: { filterIds },
      });
    }

    const { id, ...rest } = newCat;
    return { ...rest, parent: newCat.parent?.name || "" };
  },
});

export const UpdateCategory = mutationField("UpdateCategory", {
  type: CategoryMiniObj,
  args: { data: CategoryUpdateInput },
  resolve: async (_, { data }, ctx) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.category(data as any, true);

    // check if cat exist
    const addedCat = await ctx.db.category.findUnique({
      where: { id: data?.id },
      select: {
        id: true,
        type: true,
        image: true,
        banners: true,
        filterIds: true,
      },
    });

    if (!addedCat) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    // validate image/
    const imgLink =
      (
        await validator.files(
          !!data?.image ? [data?.image] : [],
          1,
          0,
          "image",
          [addedCat.image]
        )
      )[0] || "";
    const bannerLinks = await validator.files(
      data?.banners,
      3,
      0,
      "image",
      addedCat.banners
    );

    let filterIds: string[] = [];
    if (addedCat.type === CategoryType.Basic) {
      if (addedCat.filterIds.length && !data.filters?.length) {
        await ctx.db.catFilter.deleteMany({
          where: { id: { in: addedCat.filterIds } },
        });
      } else if (data.filters?.length) {
        let prevFilterIds = cloneDeep(addedCat.filterIds);
        await Promise.all(
          data.filters.map(async ({ id, name, options, unit, type }) => {
            const filter = await ctx.db.catFilter.upsert({
              where: { id },
              update: { name, options, unit, type, categoryId: addedCat.id },
              create: { name, options, unit, type, categoryId: addedCat.id },
            });
            filterIds.push(filter.id);
            prevFilterIds = prevFilterIds.filter((fid) => fid !== filter.id);
          })
        );

        if (prevFilterIds.length) {
          await ctx.db.catFilter.deleteMany({
            where: { id: { in: prevFilterIds } },
          });
        }
      }
    }

    const cat = await ctx.db.category.update({
      where: { id: addedCat.id },
      data: {
        name: data.name,
        description: data.description,
        image: imgLink,
        banners: bannerLinks,
        filterIds,
      },
      select: {
        name: true,
        type: true,
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    if (cat === null) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }
    return { ...cat, parent: cat.parent?.name || "" };
  },
});

export const UpdateCategoryParent = mutationField("UpdateCategoryParent", {
  type: CategoryMiniObj,
  args: { name: nonNull(stringArg()), parent: nonNull(stringArg()) },
  resolve: async (_, { name, parent }, ctx) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    // validate data
    await validator.categoryParent(name, parent);

    // check if cat exist
    const addedCat = await ctx.db.category.findUnique({
      where: { name },
      select: {
        name: true,
        id: true,
        type: true,
      },
    });

    if (!addedCat) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    if (addedCat.type === CategoryType.SuperOrd) {
      throw new GraphQLError("Category should not have parent", {
        extensions: { statusCode: 400 },
      });
    }

    // check parent
    const catParent = await ctx.db.category.findUnique({
      where: { name: parent },
      select: { id: true, type: true, name: true },
    });
    if (!catParent) {
      throw new GraphQLError("Parent category does not exist", {
        extensions: { statusCode: 404 },
      });
    }

    if (
      (addedCat.type === CategoryType.Basic &&
        catParent?.type !== CategoryType.SuperOrd) ||
      (addedCat.type === CategoryType.SubOrd &&
        catParent?.type !== CategoryType.Basic)
    ) {
      throw new GraphQLError("Sorry, you can't add to this category", {
        extensions: { statusCode: 400 },
      });
    }

    await ctx.db.category.update({
      where: { id: addedCat.id },
      data: {
        parentId: catParent.id,
      },
    });
    return { ...addedCat, parent: catParent.name };
  },
});
