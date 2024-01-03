import { GraphQLError } from "graphql";
import middleware from "../../../middlewares/middlewares";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import { Brand } from "../../../@types/brand";

const resolvers = {
  GetBrand: async (
    _: any,
    { name }: { name: string },
    ctx: Context
  ): Promise<Brand> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    try {
      const brand = await ctx.db.brand.findUnique({
        where: { name },
        select: { name: true, image: true },
      });

      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }

      return { ...brand, image: [brand.image] };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  GetBrands: async (_: any, a: any, ctx: Context): Promise<Brand[]> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    try {
      const brands = await ctx.db.brand.findMany({
        select: { name: true, image: true },
      });

      return brands.map((brd) => ({ ...brd, image: [brd.image] }));
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
};
export default resolvers;
