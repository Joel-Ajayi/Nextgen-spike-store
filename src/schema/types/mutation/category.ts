import { mutationField, nonNull, stringArg } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { CategoryMini } from "../objects";
import { validator } from "../../../helpers/validator";
import { GraphQLError } from "graphql";
import { CategoryInput, CategoryUpdateInput } from "../inputs";
import consts from "../../../@types/conts";
import { Category } from "@prisma/client";

export const CreateCategory = mutationField("CreateCategory", {
  type: CategoryMini,
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
      hasWarranty: boolean;
      hasMfg: boolean;
    } | null = null;
    if (data?.parent) {
      parent = await ctx.db.category.findUnique({
        where: { name: data.parent },
        select: { id: true, lvl: true, hasWarranty: true, hasMfg: true },
      });
      if (!parent) {
        throw new GraphQLError("Parent category does not exist", {
          extensions: { statusCode: 404 },
        });
      }
    }

    // check if brand exist
    let brandId: string | null = null;
    if (data?.brand) {
      const brand = await ctx.db.brand.findUnique({
        where: { name: data.brand },
      });
      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }
      brandId = brand.id;
    }

    if (!data.hasWarranty && parent?.hasWarranty) {
      throw new GraphQLError("Category requires warranty", {
        extensions: { statusCode: 404 },
      });
    }

    if (!data.hasMfg && parent?.hasMfg) {
      throw new GraphQLError("Category requires production details", {
        extensions: { statusCode: 404 },
      });
    }

    // validate image/
    let image: string | undefined = undefined;
    if (data?.image) {
      image =
        (await validator.files(!!data?.image ? [data.image] : [], 0))[0] || "";
    }

    let newCat: {
      parent: { name: string };
    } & Category = null as any;

    try {
      const catCount = (await ctx.db.category.count()) + 1;
      // add category
      newCat = (await ctx.db.category.create({
        data: {
          name: data.name,
          lvl: !!parent ? parent.lvl + 1 : 1,
          cId: catCount,
          description: data.description,
          image,
          brdId: brandId,
          hasWarranty: data.hasWarranty,
          hasMfg: true,
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

      if (data.filters?.length) {
        // add category filters
        await ctx.db.categoryFilter.createMany({
          data: data.filters.map(({ id, ...rest }) => ({
            ...rest,
            categoryId: newCat.id,
          })),
        });
      }

      const { id, cId, ...rest } = newCat;
      return { ...rest, parent: newCat.parent?.name || "" };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});

export const UpdateCategory = mutationField("UpdateCategory", {
  type: CategoryMini,
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
        brdId: true,
        brand: { select: { name: true } },
        banners: true,
        parent: { select: { hasWarranty: true } },
        filters: { select: { id: true } },
      },
    });
    if (!addedCat) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    if (!data.hasWarranty && addedCat.parent?.hasWarranty) {
      throw new GraphQLError("Category requires warranty", {
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

    // check if brand exist
    let brandId: string | null = addedCat.brdId;
    if (data.brand && data.brand !== addedCat.brand?.name) {
      const brand = await ctx.db.brand.findUnique({
        where: { name: data.brand },
      });
      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }
      brandId = brand.id;
    } else if (!data.brand) {
      brandId = null;
    }

    // delete all filters
    let prevFilterIds = addedCat.filters.map(({ id }) => id);
    if (prevFilterIds.length && !data.filters?.length) {
      await ctx.db.categoryFilter.deleteMany({
        where: { id: { in: prevFilterIds } },
      });
    } else if (data.filters?.length) {
      await Promise.all(
        data.filters.map(async ({ id, ...rest }) => {
          const data = { ...rest, categoryId: addedCat.id };
          const filter = await ctx.db.categoryFilter.upsert({
            where: { id: id || undefined },
            create: data,
            update: data,
          });
          prevFilterIds = prevFilterIds.filter((fid) => fid !== filter?.id);
        })
      );

      // delete filter not modified
      if (prevFilterIds.length) {
        await ctx.db.categoryFilter.deleteMany({
          where: { id: { in: prevFilterIds } },
        });
      }
    }

    // validate image
    const dataImage = data?.image ? [data?.image] : [];
    const prevImage = !!addedCat?.image ? [addedCat.image] : [];
    const image = (await validator.files(dataImage, 0, 1, prevImage))[0];

    const cat = await ctx.db.category.update({
      where: { id: addedCat.id },
      data: {
        name: data.name,
        description: data.description,
        image,
        brdId: brandId,
        hasWarranty: data.hasWarranty,
        hasMfg: data.hasMfg,
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
  type: CategoryMini,
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
        hasWarranty: true,
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
      hasWarranty: boolean;
    } | null = null as any;

    if (parent) {
      // check parent
      catParent = await ctx.db.category.findUnique({
        where: { name: parent },
        select: { id: true, lvl: true, name: true, hasWarranty: true },
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

      if (!addedCat.hasWarranty && catParent && catParent.hasWarranty) {
        throw new GraphQLError("Category requires warranty", {
          extensions: { statusCode: 404 },
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
