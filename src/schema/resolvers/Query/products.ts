import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";

import {
  CatalogSortQueries,
  OrderStatus,
  PaymentStatus as PayStatus,
  PaymentType as PaymentTypes,
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

      const payments = helpers.getObjKeys<string>(PaymentTypes);
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
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  GetCartItems: async (
    _: any,
    { ids, qtys }: { ids: string[]; qtys: number[] }
  ) => {
    if (ids.length !== qtys.length) {
      throw new GraphQLError("Invalid Cart Items", {
        extensions: { statusCode: 400 },
      });
    }
    try {
      const data: { [key in string]: number } = {};
      ids.forEach((id, i) => {
        data[id] = qtys[i];
      });

      const products = await db.product.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          rating: true,
          price: true,
          count: true,
          discount: true,
          images: true,
          paymentType: true,
        },
      });

      let shippingAmount = consts.product.shippingAmount;
      let subTotalAmount = 0;

      const paymentMethods = helpers.getObjKeys<string>(PaymentTypes);

      const items = products.map(({ images, paymentType, ...prd }) => {
        const discountPrice = Number(
          (((100 - prd.discount) / 100) * prd.price).toFixed(0)
        );
        if (paymentType === PaymentTypes.Cash_On_Delivery) {
          paymentMethods.splice(PaymentTypes.Cash_On_Delivery, 1);
        }
        subTotalAmount += discountPrice * data[prd.id];
        return {
          ...prd,
          qty: data[prd.id],
          discountPrice,
          image: images[0],
        };
      });

      return {
        items,
        shippingAmount,
        subTotalAmount,
        paymentMethods,
        totalAmount: subTotalAmount + shippingAmount,
      };
    } catch (error) {
      throw new GraphQLError(
        "Internal Server Error or Incorrect Cart Item Id",
        {
          extensions: { statusCode: 500 },
        }
      );
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
  QueryOrders: async (
    _: any,
    data: {
      skip: number;
      search: "";
      take: number;
      isAll: boolean;
      count: number;
    },
    ctx: Context
  ) => {
    if (data.isAll) {
      middleware.checkOrderUser(ctx);
    } else {
      middleware.checkUser(ctx);
    }

    try {
      const dbQuery: Prisma.OrderWhereInput = {
        OR: data.search
          ? [
              {
                pId: { mode: "insensitive", contains: data.search },
              },
              {
                user: {
                  email: { mode: "insensitive", contains: data.search },
                },
              },
            ]
          : undefined,
        userId: !data.isAll ? ctx.user.id : undefined,
      };

      const count =
        data.count ||
        (await ctx.db.order.count({
          where: dbQuery,
          orderBy: { createdAt: "desc" },
        }));

      const orders = await ctx.db.order.findMany({
        where: dbQuery,
        skip: data.skip,
        take: data.take,
        select: {
          id: true,
          pId: true,
          user: { select: { fName: true, lName: true, email: true } },
          items: {
            select: {
              qty: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          payMethod: true,
          payStatuses: { select: { createdAt: true, status: true } },
          statuses: { select: { createdAt: true, status: true } },
          totalAmount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const payStatus = helpers.getObjKeys<string>(PayStatus);
      const orderStatus = helpers.getObjKeys<string>(OrderStatus);
      const payMethods = helpers.getObjKeys<string>(PaymentTypes);

      const mapedOrders = orders.map(
        ({ user, payStatuses, statuses, items, ...o }) => {
          const currStatus = !statuses.length
            ? { createdAt: o.createdAt, status: PayStatus.PENDING }
            : statuses.sort((a, b) => b.status - a.status)[0];
          const currPayStatus = !payStatuses.length
            ? { createdAt: o.createdAt, status: PayStatus.PENDING }
            : payStatuses.sort((a, b) => b.status - a.status)[0];

          return {
            ...o,
            createdAt: o.createdAt.toDateString(),
            user: { name: `${user.fName} ${user.lName}` },
            payMethod: payMethods[o.payMethod],
            payStatus: {
              status: payStatus[currPayStatus.status],
              createdAt: currPayStatus.createdAt.toDateString(),
              ok: PayStatus.PAID === currPayStatus.status,
              msg: helpers.getOrderPayMsg(currPayStatus.status),
            },
            status: {
              status: orderStatus[currStatus.status],
              createdAt: currStatus.createdAt.toDateString(),
              ok: OrderStatus.DELIVERED === currStatus.status,
              msg: helpers.getOrderMsg(currStatus.status),
            },
            items: items.map(({ product: { images, ...prd }, ...i }) => ({
              ...i,
              ...prd,
              image: images[0],
            })),
          };
        }
      );

      return {
        list: mapedOrders,
        ...helpers.paginate(count, data.take, data.skip),
      };
    } catch (error) {
      console.log(error);
      helpers.error(error);
    }
  },
  QueryOrder: async (
    _: any,
    data: { id: string; isAll: boolean },
    ctx: Context
  ) => {
    if (data.isAll) {
      middleware.checkOrderUser(ctx);
    } else {
      middleware.checkUser(ctx);
    }

    try {
      const order = await ctx.db.order.findUnique({
        where: {
          id: helpers.getValidId(data.id),
          userId: data.isAll ? undefined : ctx.user.id,
        },
        select: {
          id: true,
          pId: true,
          user: { select: { email: true, fName: true, lName: true } },
          items: {
            select: {
              price: true,
              qty: true,
              product: {
                select: { name: true, id: true, rating: true, images: true },
              },
            },
          },
          statuses: { select: { createdAt: true, status: true } },
          payMethod: true,
          payStatuses: true,
          totalAmount: true,
          subTotalAmount: true,
          shippingAmount: true,
          address: {
            select: {
              id: true,
              name: true,
              state: true,
              city: true,
              locality: true,
              address: true,
              addressType: true,
              tel: true,
            },
          },
          createdAt: true,
        },
      });

      if (!order) {
        throw new GraphQLError("Order Does not Exist", {
          extensions: { statusCode: 400 },
        });
      }

      const payMethods = helpers.getObjKeys<string>(PaymentTypes);
      const payStatuses = helpers.getObjKeys<string>(PayStatus);
      const orderStatuses = helpers.getObjKeys<string>(OrderStatus);

      return {
        ...order,
        createdAt: order.createdAt.toDateString(),
        user: {
          email: order.user.email,
          name: `${order.user.fName} ${order.user.lName}`,
        },
        payMethod: payMethods[order.payMethod],
        address: {
          ...order.address,
          isNew: false,
          tel: order.address.tel
            .toString()
            .replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3"),
        },
        payStatuses: payStatuses.map((status, index) => {
          const savedStatus =
            index === PayStatus.PENDING
              ? order.createdAt
              : order.payStatuses.find((s) => s.status === index)?.createdAt;
          return {
            status,
            createdAt: savedStatus?.toDateString() || "",
            msg: "",
            ok: !!savedStatus,
          };
        }),
        statuses: orderStatuses.map((status, index) => {
          const savedStatus =
            index === OrderStatus.ORDERED
              ? order.createdAt
              : order.statuses.find((s) => s.status === index)?.createdAt;
          return {
            status,
            createdAt: savedStatus?.toDateString() || "",
            msg: "",
            ok: !!savedStatus,
          };
        }),
        items: order.items.map(({ product: { images, ...prd }, ...i }) => ({
          ...i,
          ...prd,
          image: images[0],
        })),
      };
    } catch (error) {
      console.log(error);
      helpers.error(error);
    }
  },
};

export default resolvers;
