import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";
import { colours } from "../../../db/app.data";
import {
  PaymentType,
  Product,
  ProductBoilerPlate,
  ProductMini,
} from "../../../@types/products";
import { CategoryFeature } from "../../../@types/categories";

const resolvers = {
  GetProduct: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ): Promise<Product> => {
    const product = await ctx.db.product.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        cId: true,
        images: true,
        brand: true,
        colours: true,
        sku: true,
        paymentType: true,
        price: true,
        count: true,
        description: true,
        discount: true,
        features: true,
        mfgCountry: true,
        mfgDate: true,
        warrDuration: true,
        warrCovered: true,
      },
    });

    if (!product) {
      throw new GraphQLError(consts.errors.product.prdNotFound, {
        extensions: { statusCode: 404 },
      });
    }
    return { ...product, brand: product.brand.name };
  },
  GetProductMini: async (
    _: any,
    { id, category }: { id: string; category: string },
    ctx: Context
  ): Promise<ProductMini> => {
    try {
      const product = await ctx.db.product.findFirst({
        where: { id, category: { name: category } },
        select: {
          id: true,
          name: true,
          cId: true,
          images: true,
          brand: true,
          colours: true,
          price: true,
          description: true,
          discount: true,
          rating: true,
          reviews: true,
          features: true,
        },
      });

      if (!product) {
        throw new GraphQLError(consts.errors.product.prdNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      const { reviews, ...rest } = product;
      return { ...rest, numReviews: reviews.length, brand: rest.brand.name };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  GetCreateProductData: async (
    _: any,
    { id }: { id?: string },
    ctx: Context
  ): Promise<ProductBoilerPlate> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    const catSelection = {
      id: true,
      name: true,
      lvl: true,
      cId: true,
      image: true,
      parent: {
        select: {
          id: true,
          name: true,
          cId: true,
        },
      },
      hasWarrantyAndProduction: true,
      features: true,
    };

    try {
      let categories = await ctx.db.category.findMany({
        where: { parent: null },
        select: catSelection,
      });

      const brands = await ctx.db.brand.findMany({
        select: { name: true, image: true },
      });

      const payments = Object.values(PaymentType).filter((k) =>
        isNaN(Number(k))
      );

      let categoriesPath: string[] = [];
      const features: CategoryFeature[] = [];
      if (id) {
        const product = await ctx.db.product.findUnique({
          where: { id },
          select: { category: { select: { cId: true } } },
        });

        if (product?.category) {
          await (async function findPath(cId: number) {
            const category = await ctx.db.category.findUnique({
              where: { cId },
              select: catSelection,
            });

            if (category) {
              categoriesPath.unshift(category.name);
              features.push(...category.features);
              categories.push(category);
              if (category.parent?.cId) await findPath(category.parent?.cId);
            }
          })(product.category.cId);
        }
      }
      categoriesPath = ["", ...categoriesPath];

      return {
        colours,
        brands: brands.map((brd) => ({ ...brd, image: [brd.image] })),
        categories: categories.map((cat) => ({
          ...cat,
          parent: cat.parent?.id || "",
        })),
        categoriesPath,
        features,
        paymentTypes: payments.map((type, val) => ({
          val,
          type: type as string,
        })),
      };
    } catch (error) {
      console.log((error as any).message);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
};

export default resolvers;
