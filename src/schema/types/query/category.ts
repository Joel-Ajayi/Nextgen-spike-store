import { GraphQLError } from "graphql";
import { list, nonNull, queryField, stringArg } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { CategoryMini, Category } from "../objects";
import consts from "../../../@types/conts";

export const GetCategories = queryField("GetCategories", {
  type: nonNull(list(nonNull(CategoryMini))),
  resolve: async (_, data, ctx) => {
    try {
      const categories = await ctx.db.category.findMany({
        select: {
          name: true,
          lvl: true,
          hasWarranty: true,
          hasMfg: true,
          parent: {
            select: {
              name: true,
            },
          },
        },
      });

      return categories.map((cat) => ({
        ...cat,
        parent: cat.parent?.name || "",
      }));
    } catch (error) {
      console.log(error);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});

export const GetCategory = queryField("GetCategory", {
  type: Category,
  args: {
    name: nonNull(stringArg()),
  },
  resolve: async (_, { name }, ctx) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    try {
      const category = await ctx.db.category.findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          lvl: true,
          description: true,
          image: true,
          banners: true,
          hasWarranty: true,
          hasMfg: true,
          brand: { select: { name: true } },
          parent: { select: { name: true } },
          filters: {
            select: {
              id: true,
              name: true,
              unit: true,
              options: true,
              isRequired: true,
              type: true,
            },
          },
        },
      });

      if (!category) {
        throw new GraphQLError(consts.errors.categories.catNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      return {
        ...category,
        brand: category.brand?.name || "",
        parent: category?.parent?.name,
        description: category.description || "",
        image: category.image ? [category.image] : [],
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});
