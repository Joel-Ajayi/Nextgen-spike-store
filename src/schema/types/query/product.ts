import { booleanArg, nonNull, queryField, stringArg } from "nexus";
import {
  CreateProductData,
  FilterPageProduct,
  Product,
  ProductMini,
} from "../objects";
import { GraphQLError } from "graphql";
import consts from "../../../@types/conts";
import { Roles } from "../../../@types/User";
import middleware from "../../../middlewares/middlewares";
import { colours } from "../../../db/app.data";
import { PAYMENTMETHOD } from "@prisma/client";

export const GetProduct = queryField("GetProduct", {
  type: Product,
  args: {
    id: nonNull(stringArg()),
    category: nonNull(stringArg()),
  },
  resolve: async (_, { id, category }, ctx) => {
    const isAdmin = ctx.user.role > Roles.User;

    const product = await ctx.db.product.findFirst({
      where: { id, category: { name: category } },
      select: {
        id: isAdmin,
        name: true,
        category: { select: { name: true } },
        images: true,
        brand: true,
        colors: true,
        payment: true,
        price: true,
        description: true,
        discount: true,
        filters: {
          select: {
            id: isAdmin,
            values: true,
            optionId: true,
            option: { select: { name: true, unit: true, type: true } },
          },
        },
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

    const requiredFilters = product?.filters.map(({ option, ...rest }) => ({
      ...rest,
      ...option,
    }));

    const { filters, ...rest } = product;
    return {
      ...rest,
      brand: rest.brand.name,
      category: rest.category.name,
      filters: requiredFilters,
    };
  },
});

export const GetProductMini = queryField("GetProductMini", {
  type: FilterPageProduct,
  args: {
    id: nonNull(stringArg()),
    category: nonNull(stringArg()),
  },
  resolve: async (_, { id, category }, ctx) => {
    try {
      const product = await ctx.db.product.findFirst({
        where: { id, category: { name: category } },
        select: {
          id: true,
          name: true,
          category: { select: { name: true } },
          images: true,
          brand: true,
          colors: true,
          price: true,
          description: true,
          discount: true,
          rating: true,
          reviews: true,
          filters: {
            select: {
              id: true,
              values: true,
              optionId: true,
              option: { select: { name: true, unit: true, type: true } },
            },
          },
        },
      });

      if (!product) {
        throw new GraphQLError(consts.errors.product.prdNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      // Get number of ratings and comments
      const { numRating, numReviews } = product.reviews.reduce(
        (prevVal, review) => {
          const newNumReview = prevVal.numReviews + (review.comment ? 1 : 0);
          const newNumRating = prevVal.numRating + (review.rating ? 1 : 0);
          return { numReviews: newNumReview, numRating: newNumRating };
        },
        { numReviews: 0, numRating: 0 }
      );

      // map out required values of filters
      const requiredFilters = product?.filters.map(({ option, ...rest }) => ({
        ...rest,
        ...option,
      }));

      const { reviews, ...rest } = product;
      return {
        ...rest,
        brand: rest.brand.name,
        filters: requiredFilters,
        numRating,
        numReviews,
        category: product.category.name,
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});

export const GetFilterPageProduct = queryField("GetFilterPageProduct", {
  type: ProductMini,
  args: {
    id: nonNull(stringArg()),
    category: nonNull(stringArg()),
    reqImages: nonNull(booleanArg()),
  },
  resolve: async (_, { id, category, reqImages }, ctx) => {
    try {
      const product = await ctx.db.product.findFirst({
        where: { id, category: { name: category } },
        select: {
          id: true,
          name: true,
          price: true,
          category: { select: { name: true } },
          cId: true,
          brand: true,
          rating: true,
          discount: true,
          images: reqImages,
        },
      });

      if (!product) {
        throw new GraphQLError(consts.errors.product.prdNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      return {
        ...product,
        brand: product.brand.name,
        category: product.category.name,
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});

export const GetCreateProductData = queryField("GetCreateProductData", {
  type: CreateProductData,
  resolve: async (_, args, ctx) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    try {
      const categories = await ctx.db.category.findMany({
        select: {
          name: true,
          lvl: true,
          image: true,
          parent: {
            select: {
              name: true,
            },
          },
        },
      });

      const brands = await ctx.db.brand.findMany({
        select: { name: true, image: true },
      });

      return {
        colours,
        brands: brands.map((brd) => ({ ...brd, image: [brd.image] })),
        categories: categories.map((cat) => ({
          ...cat,
          parent: cat.parent?.name || "",
        })),
        paymentMethods: Object.values(PAYMENTMETHOD) as string[],
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});
