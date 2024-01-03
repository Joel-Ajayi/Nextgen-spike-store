import { GraphQLError } from "graphql";
import { Roles, User } from "../../../@types/users";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";
import { colours } from "../../../db/app.data";
import { PaymentType, ProductBoilerPlate } from "../../../@types/products";

const resolvers = {
  GetProduct: async (
    _: any,
    { id, category }: { id: string; category: string },
    ctx: Context
  ) => {
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
  GetProductMini: async (
    _: any,
    { id, category }: { id: string; category: string },
    ctx: Context
  ) => {
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
  GetCreateProductData: async (
    _: any,
    args: any,
    ctx: Context
  ): Promise<ProductBoilerPlate> => {
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
        paymentTypes: Object.values(PaymentType) as PaymentType[],
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
};
export default resolvers;
