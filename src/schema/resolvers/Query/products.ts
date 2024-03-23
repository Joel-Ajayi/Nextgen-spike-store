import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";

import {
  PaymentType,
  Product,
  ProductMini,
  ProductMini2,
} from "../../../@types/products";
import {
  CategoryFeature,
  CategoryFeatureType,
} from "../../../@types/categories";
import { Pagination, ProductFilter, ProductFilterSort } from "../../../@types";
import { getObjKeys, getObjValues } from "../../../helpers";
import { db } from "../../../db/prisma/connect";
import { Prisma } from "@prisma/client";

const resolvers = {
  GetProduct: async (
    _: any,
    { id }: { id: string },
    ctx: Context
  ): Promise<Product> => {
    const product = await db.product.findFirst({
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
        numSold: true,
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
      const product = await db.product.findFirst({
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
          numSold: true,
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
  ProductFormData: async (_: any, { id }: { id?: string }, ctx: Context) => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    const catSelection = {
      id: true,
      name: true,
      lvl: true,
      cId: true,
      icon: true,
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
      const categories = await db.category.findMany({
        select: catSelection,
      });

      const brands = await db.brand.findMany({
        select: { name: true, image: true },
      });

      const payments = getObjKeys<string>(PaymentType);
      const featureTypes = getObjKeys<string>(CategoryFeatureType);

      let categoriesPath: string[] = [];
      const features: CategoryFeature[] = [];
      if (id) {
        const product = await db.product.findUnique({
          where: { id },
          select: { category: { select: { cId: true } } },
        });

        if (product?.category) {
          await (async function findPath(cId: number) {
            const category = categories.find((c) => c.cId === cId);

            if (category) {
              categoriesPath.unshift(category.name);
              features.push(...category.features);
              if (category.parent?.cId) await findPath(category.parent?.cId);
            }
          })(product.category.cId);
        }
      }
      categoriesPath = ["", ...categoriesPath];

      return {
        brands,
        categories: categories.map((cat) => ({
          ...cat,
          parent: cat.parent?.id || "",
          offers: [],
        })),
        categoriesPath,
        features,
        featureTypes,
        paymentTypes: payments.map((type, val) => ({ val, type })),
      };
    } catch (error) {
      console.log((error as any).message);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  GetProductsMini2: async (
    _: any,
    query: { skip: number; take: number }
  ): Promise<Pagination<ProductMini2>> => {
    const count = await db.product.count();
    const products = await db.product.findMany({
      take: query.take,
      skip: query.skip,
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
        rating: true,
        price: true,
        count: true,
      },
    });

    const skip = query.skip;
    const list = [products.map((f) => ({ ...f, category: f.category.name }))];
    const page = Math.ceil(skip / query.take);
    const numPages = Math.ceil(count / query.take);
    return { skip, count, take: query.take, page, list, numPages };
  },
  FilterProducts: async (
    _: any,
    query: ProductFilter
  ): Promise<Pagination<ProductMini>> => {
    const count = await db.product.count();

    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    if (query.sortBy) {
      switch (query.sortBy.replace("_", " ")) {
        case ProductFilterSort.Newest:
          orderBy.push({ createdAt: "desc" });
          break;
        case ProductFilterSort.Popular:
          orderBy.push(
            { rating: "desc" },
            { numSold: "desc" },
            { reviews: { _count: "desc" } }
          );
          break;
        case ProductFilterSort.Price:
          orderBy.push({ price: "asc" });
          break;
        case ProductFilterSort.Price2:
          orderBy.push({ price: "desc" });
          break;
        default:
          break;
      }
    }

    let priceFilter: Prisma.FloatFilter | undefined = undefined;
    if (query.price) {
      priceFilter = { gte: query.price.from, lte: query.price.to };
    }

    let discountFilter: Prisma.IntFilter | undefined = undefined;
    if (query.discount) {
      const isInfinity = query.discount.to < query.discount.from;
      discountFilter = {
        gte: query.discount.from,
        lte: isInfinity ? undefined : query.discount.to,
      };
    }

    let ratingFilter: Prisma.IntFilter | undefined = undefined;
    if (query.rating) {
      ratingFilter = { gte: query.rating.from, lte: query.rating.to };
    }

    let featureFilter: Prisma.ProductFeatureListRelationFilter | undefined =
      undefined;
    if (query.filters.length) {
      featureFilter = {
        every: {
          featureId: { in: query.filters.map((f) => f.featureId) },
          value: { in: query.filters.map((f) => f.value) },
        },
      };
    }

    let coloursFiler: Prisma.StringNullableListFilter | undefined = undefined;
    if (query.colours) {
      coloursFiler = { hasSome: query.colours };
    }

    let brandFilter: Prisma.BrandWhereInput | undefined = undefined;
    if (query.brands) {
      brandFilter = { name: { in: query.brands } };
    }

    const categories: string[] = [];
    const parentCats = query.category
      ? [query.category]
      : (await db.category.findMany({ where: { parentId: null } }))?.map(
          (c) => c.name
        );
    if (parentCats.length) {
      await (async function findChildren(
        children: string[],
        parentHasOffer = false
      ) {
        await Promise.all(
          children.map(async (name) => {
            const category = await db.category.findFirst({
              where: { name },
              select: {
                name: true,
                children: { select: { name: true } },
                offers: { select: { type: true } },
              },
            });

            const checkOffers = !!query.offers.length;
            const hasOffer =
              !checkOffers ||
              category?.offers.findIndex((o) =>
                query.offers.includes(o.type)
              ) !== 0;

            if (category) {
              if (hasOffer || (!hasOffer && parentHasOffer)) {
                categories.push(category?.name);

                if (category?.children.length) {
                  await findChildren(
                    category.children.map((c) => c.name),
                    hasOffer
                  );
                }
              }
            }
          })
        );
      })(parentCats);
    }

    const list = [
      (
        await db.product.findMany({
          where: {
            category: categories.length
              ? { name: { in: categories } }
              : undefined,
            brand: brandFilter,
            price: priceFilter,
            discount: discountFilter,
            colours: coloursFiler,
            features: featureFilter,
          },
          orderBy,
          skip: query.skip,
          take: query.take,
          select: {
            id: true,
            name: true,
            price: true,
            cId: true,
            brand: true,
            discount: true,
            rating: true,
            numSold: true,
            category: true,
            images: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        })
      ).map((prd) => ({
        ...prd,
        brand: prd.brand.name,
        features: [],
        numReviews: prd._count.reviews,
        _count: undefined,
        category: prd.category?.name || "",
      })),
    ];

    const page = Math.ceil(query.skip / query.take);
    const numPages = Math.ceil(count / query.take);
    return { skip: query.skip, count, take: query.take, page, list, numPages };
  },
};

export default resolvers;
