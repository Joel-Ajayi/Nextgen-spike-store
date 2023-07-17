import { mutationField } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { BrandInput } from "../inputs";
import { Brand } from "../objects";
import { validator } from "../../../helpers/validator";
import { GraphQLError } from "graphql";
import consts from "../../../@types/conts";

export const CreateBrand = mutationField("CreateBrand", {
  type: Brand,
  args: { data: BrandInput },
  resolve: async (_, { data }, ctx) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    // validate data
    await validator.brand(data as any);
    if (!data) return null;

    try {
      // check if product brand exist
      const prevBrand = await ctx.db.brand.findUnique({
        where: { name: data.name },
      });

      // validate image/
      const prevImage = prevBrand ? [prevBrand.image] : [];
      const image = (await validator.files([data.image], 1, 1, prevImage))[0];

      const newBrd = await ctx.db.brand.upsert({
        where: { name: prevBrand?.name || "" },
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
});
