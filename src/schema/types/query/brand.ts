import { list, nonNull, queryField, stringArg } from "nexus";
import { Brand } from "../objects";
import middleware from "../../../middlewares/middlewares";
import { GraphQLError } from "graphql";
import consts from "../../../@types/conts";

export const GetBrands = queryField("GetBrands", {
  type: nonNull(list(nonNull(Brand))),
  resolve: async (_, data, ctx) => {
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
});

export const GetBrand = queryField("GetBrand", {
  type: Brand,
  args: { name: nonNull(stringArg()) },
  resolve: async (_, { name }, ctx) => {
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
});
