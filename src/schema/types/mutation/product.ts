import { mutationField } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { GraphQLError } from "graphql";
import { validator } from "../../../helpers/validator";
import { ProductInput } from "../inputs";
import { ProductMini } from "../objects";
import { PAYMENTMETHOD } from "@prisma/client";
import consts from "../../../@types/conts";
import { getSKU } from "../../../helpers";

export const CreateProduct = mutationField("CreateProduct", {
  type: ProductMini,
  args: { data: ProductInput },
  resolve: async (_, { data }, ctx) => {
    // check if logged_in
    middleware.checkAdmin(ctx);

    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.product(data);

    // check if product category exist
    const productCat = await ctx.db.category.findUnique({
      where: { cId: data.cId },
    });
    if (!productCat) {
      throw new GraphQLError("Product Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    // check if product brand exist
    const productBrd = await ctx.db.brand.findUnique({
      where: { name: data.brand },
    });
    if (!productBrd) {
      throw new GraphQLError("Product Brand not found", {
        extensions: { statusCode: 404 },
      });
    }

    // validate image/
    const images = await validator.files(
      data.images,
      consts.files.product.min,
      consts.files.product.max
    );

    // create sku
    const sku = getSKU(
      data.name,
      data.brand,
      data.price,
      data.colors,
      data.cId
    );

    try {
      // add category
      const newPrd = await ctx.db.product.create({
        data: {
          name: data.name,
          sku,
          cId: data.cId,
          description: data.description,
          price: data.price,
          brdId: data.brand,
          count: data.count || 0,
          images,
          discount: data.discount || 0,
          payment: data.payment as PAYMENTMETHOD[],
          colors: data.colors,
          mfgCountry: data.mfgCountry,
          mfgDate: data.mfgDate,
        },
        select: {
          id: true,
          name: true,
          price: true,
          category: { select: { name: true } },
          brand: { select: { name: true } },
          rating: true,
        },
      });

      // add warranty if required in category
      if (data?.warranty && productCat.hasWarranty) {
        await ctx.db.productWarranty.create({
          data: { ...data.warranty, productId: newPrd.id },
        });
      }

      // add category filters product values
      if (data?.filters?.length) {
        await Promise.all(
          data.filters.map(async ({ optionId, values }) => {
            const catFilter = await ctx.db.categoryFilter.findUnique({
              where: { id: optionId },
            });
            if (catFilter) {
              await ctx.db.categoryFilterValue.create({
                data: { productId: newPrd?.id, optionId, values },
              });
            }
          })
        );
      }

      return {
        ...newPrd,
        brand: newPrd.brand.name,
        category: newPrd.category.name,
        images: [],
        discount: 0,
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});
