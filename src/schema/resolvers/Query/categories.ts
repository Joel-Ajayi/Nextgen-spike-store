import { GraphQLError } from "graphql";
import consts from "../../../@types/conts";
import {
  Category,
  CategoryFeatureType,
  CategoryMini,
  CategoryOfferTargetAudience,
  CategoryOfferType as CategoryOfferType,
} from "../../../@types/categories";
import { Context } from "../../context";
import middleware from "../../../middlewares/middlewares";
import { getObjKeys } from "../../../helpers";

const resolvers = {
  GetCategories: async (
    _: any,
    { parent }: { parent: string },
    ctx: Context
  ): Promise<CategoryMini[]> => {
    try {
      let query = {};
      if (parent) query = { parent: { name: parent } };

      const categories = await ctx.db.category.findMany({
        where: query,
        select: {
          id: true,
          name: true,
          lvl: true,
          hasWarrantyAndProduction: true,
          cId: true,
          parent: { select: { name: true } },
          features: true,
          offers: true,
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
  GetCategory: async (
    _: any,
    { name }: { name: string },
    ctx: Context
  ): Promise<Category> => {
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
          hasWarrantyAndProduction: true,
          brand: { select: { name: true } },
          parent: { select: { name: true } },
          features: true,
          offers: true,
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
  CategoryFormData: async (_: any, {}: any, ctx: Context) => {
    // check if logged_in
    middleware.checkAdmin(ctx);
    const brands = (
      await ctx.db.brand.findMany({
        select: { name: true, image: true },
      })
    ).map((brd) => ({ ...brd, image: [brd.image] }));

    const featureTypes = getObjKeys<string>(CategoryFeatureType);
    const offerTypes = getObjKeys<string>(CategoryOfferType);
    const offerAudiences = getObjKeys<string>(CategoryOfferTargetAudience);
    return { brands, offerTypes, featureTypes, offerAudiences };
  },
};

export default resolvers;
