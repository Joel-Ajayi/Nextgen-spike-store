import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";

import {
  CatalogSortQueries,
  PaymentType,
  Product,
  ProductMini,
  QueryCatalog,
} from "../../../@types/products";
import {
  CategoryFeature,
  CategoryFeaturesMini,
  CategoryFeatureType,
  CategoryOffer,
} from "../../../@types/categories";
import { db } from "../../../db/prisma/connect";
import helpers from "../../../helpers";
import { Prisma } from "@prisma/client";
import colours from "../../../db/colours";

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
  count: true,
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
        numSold: true,
        rating: true,
        features: {
          select: {
            feature: true,
            value: true,
            id: true,
            featureId: true,
          },
        },
        mfgCountry: true,
        mfgDate: true,
        warrDuration: true,
        warrCovered: true,
        _count: {
          select: { reviews: true },
        },
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
      numReviews: product._count.reviews,
      features: product.features.map((f) => ({
        ...f,
        feature: f.feature.name,
      })),
    };
  },
  GetProductMini: async (
    _: any,
    { id, category }: { id: string; category: string },
    ctx: Context
  ): Promise<ProductMini> => {
    try {
      const product = await ctx.db.product.findFirst({
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
  GetProductsMini2: async (_: any, query: { skip: number; take: number }) => {
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
    const list = products.map((f) => ({ ...f, category: f.category.name }));
    return { list, ...helpers.paginate(count, query.take, query.skip) };
  },
  QueryCatalog: async (_: any, { data }: { data: QueryCatalog }) => {
    try {
      const whereAND: Prisma.ProductWhereInput[] = [];
      const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
      let offers: CategoryOffer[] = [];

      if (!data.skip) {
        if (data.offer && data.category) {
          const offer = await db.categoryOffer.findFirst({
            where: { id: data.offer, category: { name: data.category } },
          });
          if (offer) offers.push(offer);
        } else {
          if (data.category) {
            const category = await db.category.findFirst({
              where: { name: data.category },
              select: { offers: true },
            });
            if (category?.offers?.length) offers.push(...category.offers);
          }
        }
      }

      if (data.priceMax && data.priceMin) {
        whereAND.push({ price: { gte: data.priceMin, lte: data.priceMax } });
      }
      if (typeof data.rating === "number") {
        whereAND.push({ rating: { gte: data.rating } });
      }
      if (data.discount) {
        whereAND.push({ discount: { gte: data.discount } });
      }
      if (data.search) {
        whereAND.push({
          name: { mode: "insensitive", contains: data.search },
        });
      }
      if (data.colours.length) {
        whereAND.push({ colours: { hasSome: data.colours } });
      }
      if (data.brands.length) {
        whereAND.push({
          brand: { name: { in: data.brands, mode: "insensitive" } },
        });
      }
      if (data.filters.length) {
        data.filters.forEach((f) => {
          whereAND.push({
            features: { some: { featureId: f.id, value: { in: f.options } } },
          });
        });
      }

      if (data.sortBy) {
        switch (data.sortBy) {
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
      if (!data.category) {
        categories = (
          await db.category.findMany({
            select: {
              name: true,
              products: { select: { brand: { select: { name: true } } } },
            },
          })
        ).map((c) => {
          if (!data.skip) {
            c.products.forEach((p) => {
              const brand = p.brand.name.toLowerCase();
              if (!brands.includes(brand)) brands.push(brand);
            });
          }
          return c.name;
        });
      } else {
        const selection = {
          name: true,
          products: { select: { brand: { select: { name: true } } } },
        };
        const category = await db.category.findUnique({
          where: { name: data.category },
          select: selection,
        });

        category?.products.forEach((p) => {
          const brand = p.brand.name.toLowerCase();
          if (!brands.includes(brand)) brands.push(brand);
        });

        await (async function getDeepCategory(parent: string) {
          categories.push(parent);
          const children = await db.category.findMany({
            where: { parent: { name: parent } },
            select: selection,
          });
          await Promise.all(
            children.map(async (child) => {
              if (!data.skip) {
                child.products.forEach((p) => {
                  const brand = p.brand.name.toLowerCase();
                  if (!brands.includes(brand)) brands.push(brand);
                });
              }
              await getDeepCategory(child.name);
            })
          );
        })(data.category);

        if (!data.skip) {
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
                    type: true,
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
          })(data.category);
        }
      }
      whereAND.push({ category: { name: { in: categories } } });

      const count =
        data.count ||
        (await db.product.count({
          where: { AND: whereAND },
          orderBy,
        }));

      const products = (
        await db.product.findMany({
          where: { AND: whereAND },
          orderBy,
          skip: data.skip,
          take: data.take,
          select: {
            id: true,
            name: true,
            price: true,
            cId: true,
            brand: true,
            discount: true,
            count: true,
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

      const paginate = helpers.paginate(count, data.take, data.skip);
      return {
        colours,
        offers,
        brands,
        products: { ...paginate, list: products },
        filters,
      };
    } catch (error) {
      console.log(error);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  QueryReviews: async (
    _: any,
    data: { prd_id: string; skip: number; take: number },
    ctx: Context
  ) => {
    const product = await ctx.db.product.findFirst({
      where: { id: data.prd_id },
      select: { id: true, rating: true },
    });

    if (!product) {
      throw new GraphQLError(consts.errors.product.prdNotFound, {
        extensions: { statusCode: 404 },
      });
    }

    const count = await ctx.db.reviews.count({
      where: { productId: data.prd_id },
    });
    const reviews = await ctx.db.reviews.findMany({
      where: { productId: data.prd_id },
      // skip: data.skip,
      take: data.take || count,
      select: {
        rating: true,
        title: true,
        userId: true,
        user: {
          select: { fName: true, lName: true },
        },
        updatedAt: true,
        comment: true,
      },
    });
    const paginate = helpers.paginate(count, data.take, data.skip);

    return {
      ...paginate,
      list: reviews.map(({ user, updatedAt: date, userId, ...r }) => ({
        ...r,
        editAble: userId === ctx.user?.id,
        user: `${user.fName} ${user.lName}`,
        date: `${date.toDateString()}`,
        updatedAt: undefined,
      })),
    };
  },
};

export default resolvers;
