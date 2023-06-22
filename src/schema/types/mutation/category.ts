import { mutationField, nonNull, stringArg } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { CategoryMiniObj } from "../objects";
import { validator } from "../../../helpers/validator";
import { GraphQLError } from "graphql";
import { CategoryInput, CategoryUpdateInput } from "../inputs";
import { cloneDeep } from "lodash";
import { CONST } from "../../../@types/conts";
import { CatFilter } from "@prisma/client";

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
      throw new GraphQLError("Category name already used", {
        extensions: { statusCode: 400 },
      });
    }

    // check parent
    let parent: {
      lvl: number;
      id: string;
    } | null = null;
    if (data?.parent) {
      parent = await ctx.db.category.findUnique({
        where: { name: data.parent },
        select: { id: true, lvl: true },
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

    let newCat: {
      name: string;
      id: string;
      lvl: number;
      parent: { name: string };
    } = null as any;

    try {
      // add category
      newCat = (await ctx.db.category.create({
        data: {
          name: data.name,
          lvl: !!parent ? parent.lvl + 1 : 1,
          description: data.description,
          image: imgLink,
          banners: bannerLinks,
          parentId: !parent?.id ? undefined : parent.id,
        },
        select: {
          id: true,
          name: true,
          lvl: true,
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

    if (data.filters.length) {
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
        lvl: true,
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

    // check if cat exist
    const searchedCat = await ctx.db.category.findUnique({
      where: { name: data?.name },
      select: { id: true },
    });

    if (!!searchedCat && addedCat.id !== searchedCat?.id) {
      if (!addedCat) {
        throw new GraphQLError("Category Name already used", {
          extensions: { statusCode: 404 },
        });
      }
    }

    // validate image/
    const imgLink =
      (
        await validator.files(
          !!data?.image ? [data?.image] : [],
          1,
          0,
          "image",
          !!addedCat?.image ? [addedCat.image] : []
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
    if (addedCat.filterIds.length && !data.filters?.length) {
      await ctx.db.catFilter.deleteMany({
        where: { id: { in: addedCat.filterIds } },
      });
    } else if (data.filters?.length) {
      let prevFilterIds = cloneDeep(addedCat.filterIds);
      await Promise.all(
        data.filters.map(
          async ({ id = "", name, options, unit, type, isRequired }) => {
            let filter: CatFilter | null = null;
            if (id) {
              filter = await ctx.db.catFilter.update({
                where: { id },
                data: {
                  name,
                  options,
                  unit,
                  type,
                  categoryId: addedCat.id,
                  isRequired,
                },
              });
            } else {
              filter = await ctx.db.catFilter.create({
                data: {
                  name,
                  options,
                  unit,
                  type,
                  categoryId: addedCat.id,
                  isRequired,
                },
              });
            }

            filterIds.push(filter.id);
            prevFilterIds = prevFilterIds.filter((fid) => fid !== filter?.id);
          }
        )
      );

      if (prevFilterIds.length) {
        await ctx.db.catFilter.deleteMany({
          where: { id: { in: prevFilterIds } },
        });
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
        lvl: true,
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
        lvl: true,
      },
    });

    if (!addedCat) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    let catParent: {
      name: string;
      id: string;
      lvl: number;
    } | null = null as any;

    if (parent) {
      // check parent
      catParent = await ctx.db.category.findUnique({
        where: { name: parent },
        select: { id: true, lvl: true, name: true },
      });

      if (!catParent) {
        throw new GraphQLError("Parent category does not exist", {
          extensions: { statusCode: 404 },
        });
      }

      if (catParent?.id === addedCat.id) {
        throw new GraphQLError("Sorry, you can't add to this category", {
          extensions: { statusCode: 400 },
        });
      }

      const categories = await ctx.db.category.findMany({
        select: { id: true, parent: { select: { id: true } } },
      });

      const categoriesLinage = categories
        .filter((cat) => !cat.parent?.id)
        .map(({ id }) => [id]);

      categoriesLinage.forEach((id, i) => {
        (function pushToTree(parent: string, index: number) {
          categories
            .filter((cat) => cat.parent?.id === parent)
            .forEach((child) => {
              categoriesLinage[index].push(child.id);
              pushToTree(child.id, index);
            });
        })(id[0], i);
      });

      const parentLineIndex = categoriesLinage.findIndex(
        (line) => line.findIndex((id) => id === catParent?.id) !== -1
      );
      const categoryLineIndex = categoriesLinage.findIndex(
        (line) => line.findIndex((id) => id === addedCat.id) !== -1
      );

      if (
        parentLineIndex === categoryLineIndex &&
        catParent.lvl > addedCat.lvl
      ) {
        throw new GraphQLError("Sorry, you can't add to this category", {
          extensions: { statusCode: 400 },
        });
      }
    }

    await ctx.db.category.update({
      where: { id: addedCat.id },
      data: {
        parentId: catParent ? catParent.id : null,
        lvl: catParent ? catParent.lvl + 1 : 1,
      },
    });
    return { ...addedCat, parent: catParent?.name || "" };
  },
});
