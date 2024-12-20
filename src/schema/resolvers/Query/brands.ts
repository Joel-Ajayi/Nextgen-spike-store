import { GraphQLError } from "graphql";
import middleware from "../../../middlewares/middlewares";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import { Brand } from "../../../@types/brand";
import { db } from "../../../db/prisma/connect";
import helpers from "../../../helpers";

const resolvers = {
  GetBrand: async (_: any, { name }: { name: string }, ctx: Context) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    try {
      const brand = await db.brand.findUnique({
        where: { name },
        select: { name: true, image: true },
      });

      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }

      return { ...brand, image: brand.image };
    } catch (error) {
      helpers.error(error);
    }
  },
  GetBrands: async (_: any, a: any, ctx: Context) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    try {
      const brands = await db.brand.findMany({
        select: { name: true, image: true },
      });

      return brands.map((brd) => ({ ...brd, image: brd.image }));
    } catch (error) {
      helpers.error(error);
    }
  },
};
export default resolvers;
