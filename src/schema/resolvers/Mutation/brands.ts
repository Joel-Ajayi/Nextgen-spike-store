import { GraphQLError } from "graphql";
import { Brand, Brand_I } from "../../../@types/brand";
import consts from "../../../@types/conts";
import { validator } from "../../../helpers/validator";
import middleware from "../../../middlewares/middlewares";
import { Context } from "../../context";

const resolvers = {
  CreateBrand: async (
    _: any,
    { data }: { data: Brand_I },
    ctx: Context
  ): Promise<Brand> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    // validate data
    await validator.brand(data);

    try {
      // check if product brand exist
      const prevBrand = await ctx.db.brand.findUnique({
        where: { name: data.name },
      });

      // validate image/
      const prevImage = prevBrand ? [prevBrand.image] : [];
      const image = (await validator.files([data.image], 1, 1, prevImage))[0];

      const newBrd = await ctx.db.brand.upsert({
        where: { name: data.id },
        update: { name: data.name, image },
        create: { name: data.name, image },
        select: { name: true, image: true },
      });

      return { ...newBrd, image: [newBrd.image] };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
};
export default resolvers;
