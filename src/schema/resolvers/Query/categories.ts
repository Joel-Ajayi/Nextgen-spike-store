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
import helpers from "../../../helpers";
import { db } from "../../../db/prisma/connect";

const resolvers = {
  GetCategories: async (
    _: any,
    { parent }: { parent: string },
    ctx: Context
  ): Promise<CategoryMini[]> => {
    try {
      let query = {};
      if (parent) query = { parent: { name: parent } };

      const categories = await db.category.findMany({
        where: query,
        select: {
          id: true,
          name: true,
          icon: true,
          lvl: true,
          hasWarrantyAndProduction: true,
          cId: true,
          parent: { select: { name: true } },
          features: true,
          banner: true,
          offers: true,
          numSold: true,
        },
      });

      return categories.map((cat) => ({
        ...cat,
        icon: cat.icon || "",
        banner: cat.banner[0] || null,
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
      const category = await db.category.findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          lvl: true,
          icon: true,
          description: true,
          hasWarrantyAndProduction: true,
          brand: { select: { name: true } },
          parent: { select: { name: true } },
          banner: true,
          features: true,
          offers: true,
          numSold: true,
        },
      });

      if (!category) {
        throw new GraphQLError(consts.errors.categories.catNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      return {
        ...category,
        icon: category.icon || "",
        banner: category.banner[0] || null,
        brand: category.brand?.name || "",
        parent: category?.parent?.name,
        description: category.description || "",
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  CategoryFormData: async (_: any, {}: any, ctx: Context) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    const brands = await db.brand.findMany({
      select: { name: true, image: true },
    });

    const featureTypes = helpers.getObjKeys<string>(CategoryFeatureType);
    const offerTypes = helpers.getObjKeys<string>(CategoryOfferType);
    const offerAudiences = helpers.getObjKeys<string>(
      CategoryOfferTargetAudience
    );
    return { brands, offerTypes, featureTypes, offerAudiences };
  },
};

export default resolvers;
