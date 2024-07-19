import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";

import {
  PaymentType,
  Product,
  ProductFilter,
  ProductFilterRes,
  ProductFilterSort,
  ProductMini,
  ProductMini2,
} from "../../../@types/products";
import {
  CategoryFeature,
  CategoryFeatureType,
  CategoryMicro,
  CategoryOfferType,
} from "../../../@types/categories";
import { Pagination } from "../../../@types";
import { db } from "../../../db/prisma/connect";
import { Prisma } from "@prisma/client";
import { string } from "yup/lib/locale";
import helpers from "../../../helpers";
import { Brand } from "../../../@types/brand";

const productMiniSelect = {
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
};

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
        select: { ...productMiniSelect, features: true },
      });

      if (!product) {
        throw new GraphQLError(consts.errors.product.prdNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      const { _count, ...rest } = product;
      return { ...rest, numReviews: _count.reviews, brand: rest.brand.name };
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

      const payments = helpers.getObjKeys<string>(PaymentType);
      const featureTypes = helpers.getObjKeys<string>(CategoryFeatureType);

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
  ): Promise<ProductFilterRes> => {
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

    let priceFilter: Prisma.FloatFilter | undefined;
    if (query.price) {
      priceFilter = { gte: query.price.from, lte: query.price.to };
    }

    let discountFilter: Prisma.IntFilter | undefined;
    if (query.discount) {
      const isInfinity = query.discount.to < query.discount.from;
      discountFilter = {
        gte: query.discount.from,
        lte: isInfinity ? undefined : query.discount.to,
      };
    }

    let ratingFilter: Prisma.IntFilter | undefined;
    if (query.rating) {
      ratingFilter = { gte: query.rating.from, lte: query.rating.to };
    }

    let featureFilter: Prisma.ProductWhereInput[] | undefined;
    if (query.filters.length) {
      featureFilter = query.filters.map(({ featureId, value }) => ({
        features: { some: { featureId, value } },
      }));
    }

    let coloursFiler: Prisma.StringNullableListFilter | undefined;
    if (query.colours) {
      coloursFiler = { hasSome: query.colours };
    }

    let brandFilter: Prisma.BrandWhereInput | undefined;
    if (query.brands) {
      brandFilter = { name: { in: query.brands } };
    }

    let catParentandChildNames: string[] = [];
    const parentCats = query.category
      ? [query.category]
      : (await db.category.findMany({ where: { parentId: null } }))?.map(
          (c) => c.name
        );
    if (parentCats.length) {
      catParentandChildNames = await helpers.getParentandChildNames(
        parentCats,
        query.offers
      );
    }

    const queryfilters: {
      where: Prisma.ProductWhereInput;
      orderBy: Prisma.ProductOrderByWithRelationInput[];
    } = {
      where: {
        category: catParentandChildNames.length
          ? { name: { in: catParentandChildNames } }
          : undefined,
        rating: ratingFilter,
        brand: brandFilter,
        price: priceFilter,
        discount: discountFilter,
        colours: coloursFiler,
        AND: featureFilter,
      },
      orderBy,
    };

    const products = await db.product.findMany({
      ...queryfilters,
      select: { ...productMiniSelect, colours: true },
    });

    const list = [
      products
        .filter(
          (_, i) => i + 1 > query.skip && i + 1 <= query.take + query.skip
        )
        .map((prd) => ({
          ...prd,
          brand: prd.brand.name,
          features: [],
          numReviews: prd._count.reviews,
          _count: undefined,
          category: prd.category?.name || "",
        })),
    ];

    const page = Math.ceil(query.skip / query.take);
    const numPages = Math.ceil(products.length / query.take);
    const offers = helpers.getObjValues<string>(CategoryOfferType);

    let brands: string[] = [];
    await (async function getParent(category: string) {
      if (query.isFirstCall) {
        if (category) {
          const cat = await db.category.findUnique({
            where: { name: category },
            select: {
              parent: {
                select: { name: true, parent: { select: { name: true } } },
              },
            },
          });
          brands.push(category);
          if (cat?.parent?.name) brands.push(cat.parent.name);
          if (cat?.parent?.parent?.name) {
            await getParent(cat.parent.parent.name);
          }
        } else {
          brands = (await db.brand.findMany({ select: { name: true } })).map(
            (b) => b.name
          );
        }
      }
    })(query.category as string);

    //feature filters
    let filters: {
      id: string;
      name: string;
      options: string[];
    }[] = [];
    if (query.category && query.isFirstCall) {
      filters = await db.categoryFeature.findMany({
        where: { category: { name: query.category }, useAsFilter: true },
        select: { name: true, id: true, options: true },
      });
    }

    const colours: string[] = [];
    if (query.isFirstCall) {
      products.forEach((p) => {
        colours.push(...p.colours);
      });
    }

    return {
      offers,
      brands,
      colours,
      filters,
      products: {
        skip: query.skip,
        count: products.length,
        take: query.take,
        page,
        list,
        numPages,
      },
    };
  },
};

export default resolvers;
