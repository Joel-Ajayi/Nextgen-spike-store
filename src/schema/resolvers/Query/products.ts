import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";

import {
  CatalogSortQueries,
  PaymentType,
  Product,
  ProductMini,
  ProductMini2,
  QueryCatalog,
} from "../../../@types/products";
import {
  CategoryFeature,
  CategoryFeaturesMini,
  CategoryFeatureType,
} from "../../../@types/categories";
import { Pagination } from "../../../@types";
import { db } from "../../../db/prisma/connect";
import helpers from "../../../helpers";
import { CategoryOffer, Prisma } from "@prisma/client";

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
              features.push(...category.features.filter((f) => f.useAsFilter));
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
  QueryCatalog: async (_: any, query: QueryCatalog) => {
    const whereAND: Prisma.ProductWhereInput[] = [];
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];

    let offers: CategoryOffer[] = [];
    if (query.offer && query.category) {
      const offer = await db.categoryOffer.findFirst({
        where: { id: query.offer, category: { name: query.category } },
      });
      if (offer) offers.push(offer);
    } else {
      if (query.category) {
        const category = await db.category.findFirst({
          where: { name: query.category },
          select: { offers: true },
        });
        if (category?.offers?.length) offers.push(...category.offers);
      }
    }

    const priceMin = 999999999;
    const priceMax = 0;
    if (query.priceMax && query.priceMin) {
      whereAND.push({ price: { gte: query.priceMin, lte: query.priceMax } });
    }
    if (query.rating) {
      whereAND.push({ rating: query.rating });
    }
    if (query.discount) {
      whereAND.push({ discount: { gte: query.discount } });
    }
    if (query.search) {
      whereAND.push({ name: { mode: "insensitive", contains: query.search } });
    }
    if (query.brands.length) {
      whereAND.push({ brand: { name: { in: query.brands } } });
    }
    if (query.filters.length) {
      whereAND.push(
        ...query.filters.map((f) => ({
          features: { some: { id: f.id, value: { in: f.options } } },
        }))
      );
    }

    if (query.sortBy) {
      switch (query.sortBy) {
        case CatalogSortQueries.Hotdeals:
          orderBy.push({ discount: "desc" });
          break;
        case CatalogSortQueries.Newest:
          orderBy.push({ createdAt: "desc" });
          break;
        case CatalogSortQueries.Popular:
          orderBy.push({ numSold: "desc" });
          orderBy.push({ rating: "desc" });
          break;
        case CatalogSortQueries.PriceDesc:
          orderBy.push({ price: "desc" });
          break;
        case CatalogSortQueries.Price_asc:
          orderBy.push({ price: "asc" });
          break;
        case CatalogSortQueries.Rating:
          orderBy.push({ rating: "desc" });
          break;
        default:
          break;
      }
    }

    let categories: string[] = [];
    const brands: string[] = [];
    const filters: CategoryFeaturesMini[] = [];
    if (query.isCategoryChanged) {
      if (!query.category) {
        categories = (
          await db.category.findMany({
            select: {
              name: true,
              products: { select: { brand: { select: { name: true } } } },
            },
          })
        ).map((c) => {
          brands.push(
            ...c.products
              .filter((p) => !brands.includes(p.brand.name))
              .map((p) => p.brand.name)
          );
          return c.name;
        });
      } else {
        await (async function getDeepCategory(parent: string) {
          categories.push(query.category);

          const children = await db.category.findMany({
            where: { parent: { name: parent } },
            select: {
              name: true,
              products: { select: { brand: { select: { name: true } } } },
              features: parent !== query.category ? undefined : {},
            },
          });

          await Promise.all(
            children.map(async (child) => {
              brands.push(
                ...child.products
                  .filter((p) => !brands.includes(p.brand.name))
                  .map((p) => p.brand.name)
              );
              await getDeepCategory(child.name);
            })
          );
        })(query.category);
      }

      whereAND.push({ category: { name: { in: categories } } });

      if (query.category) {
        await (async function filterUpCategoryTree(cName: string) {
          const category = await db.category.findUnique({
            where: { name: cName },
            select: {
              parent: { select: { name: true } },
              features: {
                select: {
                  id: true,
                  options: true,
                  name: true,
                  useAsFilter: true,
                },
              },
            },
          });

          if (category) {
            filters.push(...category.features.filter((f) => f.useAsFilter));
            if (category.parent?.name) {
              await filterUpCategoryTree(category.parent?.name);
            }
          }
        })(query.category);
      }
    }

    const products = (
      await db.product.findMany({
        where: { AND: whereAND },
        orderBy,
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
          reviews: { select: { id: true } },
        },
      })
    ).map((p) => ({
      ...p,
      brand: p.brand.name,
      features: [],
      numReviews: p.reviews.length,
      reviews: undefined,
      category: p.category?.name || "",
    }));

    return {
      offers,
      price: `${priceMin}-${priceMax}`,
      brands,
      products,
      filters,
    };
  },
};

export default resolvers;
