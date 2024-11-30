import { Brand, Brand_I } from "../../../@types/brand";
import { validator } from "../../../helpers/validator";
import middleware from "../../../middlewares/middlewares";
import { Context } from "../../context";
import { upload } from "../../../helpers/uploads";
import { db } from "../../../db/prisma/connect";
import helpers from "../../../helpers";

const resolvers = {
  CreateBrand: async (
    _: any,
    { data }: { data: Brand_I },
    ctx: Context
  ): Promise<Brand | any> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);
    // validate data
    await validator.brand(data);

    try {
      // check if product brand exist
      const prevBrand = await db.brand.findUnique({
        where: { name: data.name },
      });

      // validate image/
      const isNew = !prevBrand;
      const minNum = isNew ? 1 : 0;
      const files = data.image ? [data.image] : [];
      const prevFiles = prevBrand && files.length ? [prevBrand.image] : [];
      const image = (
        await upload.files({
          folder: "brd",
          minNum,
          maxNum: 1,
          files,
          prevFiles,
        })
      )[0];

      const newBrd = await db.brand.upsert({
        where: { name: data.id },
        update: { name: data.name, image },
        create: { name: data.name, image },
        select: { name: true, image: true },
      });

      return { ...newBrd, image: newBrd.image };
    } catch (error) {
      helpers.error(error);
    }
  },
};
export default resolvers;
