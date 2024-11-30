import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";
import productsQuery from "../Query/products";
import {
  Product_I_U,
  Product_I,
  ProductUpdateReturn,
  Review_I,
  Order_I,
  PaymentType,
  InitPayment,
  OrderStatus,
  PaymentStatus,
  Cart,
} from "../../../@types/products";
import { validator } from "../../../helpers/validator";
import helpers from "../../../helpers";
import { CategoryFeature } from "../../../@types/categories";
import { upload } from "../../../helpers/uploads";
import { db } from "../../../db/prisma/connect";
import { Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdef", 10);
import axios from "axios";

const resolvers = {
  CreateProduct: async (
    _: any,
    { data }: { data: Product_I },
    ctx: Context
  ): Promise<ProductUpdateReturn | any> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    // validate data
    await validator.valProduct(data);

    try {
      // check if product category exist
      const productCategory = await db.category.findUnique({
        where: { cId: data.cId },
        select: {
          hasWarrantyAndProduction: true,
          parent: { select: { name: true } },
          features: true,
          brand: { select: { name: true } },
        },
      });

      if (!productCategory) {
        throw new GraphQLError("Product Category not found", {
          extensions: { statusCode: 404 },
        });
      }

      // check if product brand exist
      const productBrd = await db.brand.findUnique({
        where: { name: data.brand },
      });

      if (!productBrd) {
        throw new GraphQLError("Product Brand not found", {
          extensions: { statusCode: 404 },
        });
      }

      // add warranty if required in category
      if (productCategory.hasWarrantyAndProduction) {
        if (!data?.warrCovered || !data?.warrDuration || !data?.mfgDate) {
          throw new GraphQLError(
            "Product warranty and manufacturing details is required",
            {
              extensions: { statusCode: 404 },
            }
          );
        }
      }

      // Category features
      let features = [
        ...productCategory.features,
        // get features of parent category
        ...(await (async function getFeatures(
          parentCatName = ""
        ): Promise<CategoryFeature[]> {
          if (parentCatName) {
            const parentCategory = await db.category.findUnique({
              where: { name: parentCatName },
              select: { features: true, parent: { select: { name: true } } },
            });
            if (parentCategory) {
              return [
                ...parentCategory.features,
                ...(await getFeatures(parentCategory.parent?.name)),
              ];
            }
          }
          return [];
        })(productCategory.parent?.name)),
      ];

      const inputFeatureIds = data.features.map(({ featureId }) => featureId);
      features.forEach(({ id, name }) => {
        if (!inputFeatureIds.includes(id)) {
          throw new GraphQLError(`${name} feature is required`, {
            extensions: { statusCode: 404 },
          });
        }
      });

      // validate image/
      const images = await upload.files({
        folder: "prd",
        files: data.images,
        maxNum: consts.files.product.max,
        minNum: consts.files.product.min,
        prevFiles: [],
      });

      // create sku
      const sku = helpers.getSKU(
        data.name,
        data.brand,
        data.price,
        data.colours,
        data.cId
      );

      // add category
      const newProduct = await db.product.create({
        data: {
          name: data.name,
          sku,
          cId: data.cId,
          description: data.description,
          price: data.price,
          brdId: productBrd.id,
          count: data.count || 0,
          images,
          discount: data.discount || 0,
          warrCovered: data?.warrCovered,
          warrDuration: data?.warrDuration,
          paymentType: data.paymentType,
          colours: data.colours.map((c) => helpers.getCloseClolour(c)),
          mfgDate: data?.mfgDate,
        },
      });

      // add features
      const productFeatures = await Promise.all(
        data.features.map(async (f) => {
          const data = { ...f, productId: newProduct.id };
          const newFeature = await db.productFeature.create({
            data,
            select: { id: true, featureId: true, value: true },
          });
          return newFeature;
        })
      );

      return {
        id: newProduct.id,
        sku: newProduct.sku,
        features: productFeatures,
      };
    } catch (error) {
      helpers.error(error);
    }
  },
  UpdateProduct: async (
    _: any,
    { data }: { data: Product_I_U }
  ): Promise<ProductUpdateReturn | any> => {
    try {
      const product = await db.product.findUnique({
        where: { id: data.id },
        select: {
          id: true,
          images: true,
          category: {
            select: {
              name: true,
              cId: true,
              parent: { select: { name: true, id: true } },
              hasWarrantyAndProduction: true,
              brand: { select: { name: true } },
            },
          },
          warrCovered: true,
          warrDuration: true,
          mfgDate: true,
          mfgCountry: true,
          brand: { select: { name: true, id: true } },
          features: true,
        },
      });

      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: { statusCode: 400 },
        });
      }

      // if new category
      const isNewCategory =
        typeof data?.cId === "number" && data.cId !== product.category.cId;
      // get category
      const category = !isNewCategory
        ? product.category
        : await db.category.findUnique({
            where: { cId: isNewCategory ? data.cId : product.category.cId },
            select: {
              name: true,
              cId: true,
              parent: { select: { name: true, id: true } },
              hasWarrantyAndProduction: true,
              brand: { select: { name: true } },
            },
          });

      if (!category) {
        throw new GraphQLError("Product Category not found", {
          extensions: { statusCode: 404 },
        });
      }

      if (data.features?.length) {
        // Category features
        const inputFeatureIds = data.features.map(({ featureId }) => featureId);

        // check if features up in the tree are inputed
        await (async function getFeatures(
          parentCatName = ""
        ): Promise<CategoryFeature[]> {
          if (parentCatName) {
            const parentCategory = await db.category.findUnique({
              where: { name: parentCatName },
              select: {
                id: true,
                features: true,
                parent: { select: { name: true } },
              },
            });
            if (parentCategory) {
              parentCategory.features.forEach((feature) => {
                if (!inputFeatureIds.includes(feature.id)) {
                  throw new GraphQLError(
                    `${feature.name} feature is required`,
                    {
                      extensions: { statusCode: 400 },
                    }
                  );
                }
              });
              await getFeatures(parentCategory.parent?.name);
            }
          }
          return [];
        })(category.name);
      }

      // update product brand
      let brdId: string | undefined = undefined;
      if (data?.brand && data?.brand !== product.brand.name) {
        const brand = await db.brand.findUnique({
          where: { name: data.brand },
        });

        if (!brand) {
          throw new GraphQLError("Invalid brand name", {
            extensions: { statusCode: 400 },
          });
        }
        brdId = brand.id;
      }

      // check Manufacturing and Production Details
      if (
        (!product.warrCovered ||
          !product.mfgDate ||
          typeof product.warrDuration !== "number") &&
        category.hasWarrantyAndProduction
      ) {
        if (
          !data?.warrCovered ||
          !data?.mfgDate ||
          typeof data?.warrDuration !== "number"
        ) {
          throw new GraphQLError(
            "Manufacturing and Production details is required for New Category",
            {
              extensions: { statusCode: 400 },
            }
          );
        }
      }

      // check images
      let images: undefined | string[] = undefined;
      if (data?.images) {
        images = await upload.files({
          folder: "prd",
          files: data.images,
          maxNum: consts.files.product.max,
          minNum: consts.files.product.min,
          prevFiles: product.images,
        });
      }

      const newPrd = await db.product.update({
        where: { id: data.id },
        data: {
          name: data?.name || undefined,
          cId: typeof data?.cId === "number" ? data?.cId : undefined,
          description: data?.description || undefined,
          price: typeof data?.price === "number" ? data?.price : undefined,
          count: typeof data?.count === "number" ? data.count : undefined,
          discount:
            typeof data?.discount === "number" ? data?.discount : undefined,
          paymentType:
            typeof data.paymentType === "number" ? data.paymentType : undefined,
          colours: data?.colours?.length
            ? data.colours.map((c) => helpers.getCloseClolour(c))
            : undefined,
          mfgDate: data?.mfgDate || undefined,
          warrCovered: data?.warrCovered || undefined,
          warrDuration: data?.warrDuration || undefined,
          brdId,
          images,
        },
      });

      let productFeatures = product.features;
      if (data?.features?.length) {
        // delete previous features if new category
        let prevFeaturesId = product.features.map((f) => f.id);

        // create new features
        productFeatures = await Promise.all(
          data.features.map(
            async ({ id: inputFeatureId, feature, ...inputFeature }) => {
              const id = helpers.getValidId(inputFeatureId || "");
              const featureData = { ...inputFeature, productId: data.id };

              if (isNewCategory) {
                prevFeaturesId = prevFeaturesId.filter(
                  (prevId) => prevId !== id
                );
              }

              return await db.productFeature.upsert({
                where: { id },
                create: featureData,
                update: featureData,
              });
            }
          )
        );

        if (isNewCategory) {
          await db.productFeature.deleteMany({
            where: { id: { in: prevFeaturesId } },
          });
        }
      }

      // create sku
      const sku = helpers.getSKU(
        newPrd.name,
        data.brand || product.brand.name,
        newPrd.price,
        newPrd.colours,
        newPrd.cId
      );
      await db.product.update({ where: { id: data.id }, data: { sku } });

      return { id: newPrd.id, sku, features: productFeatures };
    } catch (error) {
      helpers.error(error);
    }
  },
  UpdateReview: async (_: any, { data }: { data: Review_I }, ctx: Context) => {
    middleware.checkUser(ctx);

    try {
      let prd = await ctx.db.product.findFirst({
        where: { id: data.prd_id },
        select: {
          id: true,
          reviews: { select: { rating: true, userId: true } },
        },
      });

      if (!prd?.id) {
        throw new GraphQLError(consts.errors.product.prdNotFound, {
          extensions: { statusCode: 404 },
        });
      }

      let review = await ctx.db.reviews.findFirst({
        where: { userId: ctx.user.id, productId: data.prd_id },
        select: { id: true },
      });

      const id = helpers.getValidId(review?.id || "");

      const newReview: Prisma.ReviewsUncheckedCreateInput = {
        userId: ctx.user.id,
        productId: data.prd_id,
        title: data.title,
        comment: data.comment,
        rating: data.rating,
      };

      await ctx.db.reviews.upsert({
        where: { id },
        create: newReview,
        update: newReview,
      });

      const reviews = prd.reviews.filter((r) => r.userId !== ctx.user.id);
      let ratersCount = newReview.rating ? 1 : 0;
      const ratingsSum =
        (newReview?.rating || 0) +
        reviews.reduce((curr, review) => {
          if (review.rating) {
            ratersCount += 1;
          }
          return curr + review.rating;
        }, 0);

      await ctx.db.product.update({
        where: { id: data.prd_id },
        data: {
          rating: parseFloat((ratingsSum / ratersCount).toFixed(1)),
        },
      });
      return { message: "Review Updated" };
    } catch (error) {
      helpers.error(error);
    }
  },
  DeleteReview: async (
    _: any,
    { prd_id }: { prd_id: string },
    ctx: Context
  ) => {
    middleware.checkUser(ctx);

    try {
      let review = await ctx.db.reviews.findFirst({
        where: { userId: ctx.user.id, productId: prd_id },
        select: { id: true },
      });

      if (!review) {
        throw new GraphQLError("Review not found", {
          extensions: { statusCode: 400 },
        });
      }

      await ctx.db.reviews.delete({ where: { id: review.id } });
      return { message: "Review Deleted" };
    } catch (error) {
      helpers.error(error);
    }
  },
  CreateOrder: async (_: any, { data }: { data: Order_I }, ctx: Context) => {
    middleware.checkUser(ctx);

    let newOrderId = "";
    try {
      const paymentMethods = helpers.getObjIndexes<number>(PaymentType);

      // check payment
      if (!paymentMethods.includes(data.paymentMethod)) {
        throw new GraphQLError("Invalid Payment Type", {
          extensions: { statusCode: 400 },
        });
      }

      // check address
      const shippingAddress = await ctx.db.address.findUnique({
        where: { id: data.shippingAddress },
      });
      if (!shippingAddress) {
        throw new GraphQLError("Shipping address not found", {
          extensions: { statusCode: 400 },
        });
      }

      const {
        items,
        paymentMethods: p,
        ...sumary
      } = (await productsQuery.GetCartItems(null, {
        ids: data.itemIds,
        qtys: data.itemQtys,
      })) as Cart;

      const ordersCount = await ctx.db.order.count({
        where: { userId: ctx.user.id },
      });

      let pId = `${nanoid()}${ordersCount}`;
      let access_code = "";

      if (data.paymentMethod === PaymentType.Card) {
        const response = await axios.post<InitPayment>(
          consts.product.payment.init,
          {
            email: ctx.user.email,
            amount: sumary.totalAmount,
            channels: consts.product.payment.channels,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.PAYMENT_SECRET}`,
            },
          }
        );
        pId = response.data.data.reference;
        access_code = response.data.data.access_code;
      }

      const order = await ctx.db.order.create({
        data: {
          ...sumary,
          addressId: data.shippingAddress,
          payMethod: data.paymentMethod,
          userId: ctx.user.id,
          pId,
        },
      });
      newOrderId = order.id;

      await ctx.db.orderItem.createMany({
        data: items.map((i) => ({
          orderId: order.id,
          productId: i.id,
          price: i.discountPrice,
          qty: i.qty,
        })),
      });

      return { orderId: newOrderId, access_code };
    } catch (error) {
      helpers.error(error);
      if (newOrderId) {
        await ctx.db.order.delete({ where: { id: newOrderId } });
      }
    }
  },
  CancelOrder: async (_: any, { id }: { id: string }, ctx: Context) => {
    middleware.checkUser(ctx);

    try {
      const order = await ctx.db.order.findUnique({
        where: {
          id: helpers.getValidId(id),
          userId: ctx.user.id,
        },
        select: { statuses: { select: { status: true } } },
      });

      if (!order) {
        throw new GraphQLError("Order Does not Exist", {
          extensions: { statusCode: 404 },
        });
      }

      const isCancelled = order.statuses
        .map((s) => s.status)
        .includes(OrderStatus.Canceled);

      if (isCancelled) {
        throw new GraphQLError("Order Is Already Canceled", {
          extensions: { statusCode: 400 },
        });
      }

      const isDelivered = order.statuses
        .map((s) => s.status)
        .includes(OrderStatus.Delivered);
      if (isDelivered) {
        throw new GraphQLError("Order Is Already Delivered", {
          extensions: { statusCode: 400 },
        });
      }

      await ctx.db.orderStatus.create({
        data: { status: OrderStatus.Canceled, orderId: id },
      });

      return { message: "Order has been Cancelled" };
    } catch (error) {
      helpers.error(error);
    }
  },
  SaveOrderChanges: async (
    _: any,
    {
      id,
      payStatus,
      status,
    }: { payStatus: number; status: number; id: string },
    ctx: Context
  ) => {
    middleware.checkOrderUser(ctx);

    try {
      const order = await ctx.db.order.findUnique({
        where: {
          id: helpers.getValidId(id),
        },
        select: {
          pId: true,
          payMethod: true,
          statuses: { select: { status: true } },
          payStatuses: { select: { status: true } },
        },
      });

      if (!order) {
        throw new GraphQLError("Order Does not Exist", {
          extensions: { statusCode: 404 },
        });
      }

      const payStatusesString = helpers.getObjKeys<string>(PaymentStatus);
      const orderStatusesString = helpers.getObjKeys<string>(OrderStatus);
      if (!orderStatusesString[status] || !payStatusesString[payStatus]) {
        throw new GraphQLError("Invalid Payment or Order Status", {
          extensions: { statusCode: 400 },
        });
      }

      const statuses = order.statuses.map((s) => s.status);
      const payStatuses = order.payStatuses.map((s) => s.status);

      const isStatusSet =
        status === OrderStatus.Ordered ? true : statuses.includes(status);

      const isPayStatusSet =
        payStatus === PaymentStatus.Pending
          ? true
          : payStatuses.includes(payStatus);
      if (!isPayStatusSet) {
        if (payStatus === PaymentStatus.Paid) {
          if (order.payMethod === PaymentType.Card) {
            //confirm bank card payment
            const response = await axios.get<{
              data: { status: string };
            }>(`${consts.product.payment.validate}/${order.pId}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.PAYMENT_SECRET}`,
              },
            });

            if (response.data.data.status !== "success") {
              throw new GraphQLError(
                helpers.getOrderPayMsg(PaymentStatus.Pending),
                {
                  extensions: { statusCode: 400 },
                }
              );
            }
          }
          await ctx.db.payStatus.create({
            data: { status: PaymentStatus.Paid, orderId: id },
          });
        } else {
          if (payStatuses.includes(PaymentStatus.Paid)) {
            await ctx.db.payStatus.create({
              data: { status: PaymentStatus.Refunded, orderId: id },
            });
          } else {
            throw new GraphQLError("Order has not been Paid for", {
              extensions: { statusCode: 400 },
            });
          }
        }
      }

      if (!isStatusSet) {
        const newStatuses = helpers
          .getObjIndexes<number>(OrderStatus)
          .filter(
            (s) =>
              !statuses.includes(s) && s <= status && s !== OrderStatus.Ordered
          )
          .map((s) => ({ status: s, orderId: id }));

        if (newStatuses.length) {
          await ctx.db.orderStatus.createMany({
            data: newStatuses,
          });
        }
      }

      return { message: "Order Updated" };
    } catch (error) {
      helpers.error(error);
    }
  },
  VerifyOrderPay: async (_: any, { id }: { id: string }, ctx: Context) => {
    try {
      const order = await ctx.db.order.findUnique({
        where: {
          id: helpers.getValidId(id),
        },
        select: {
          payMethod: true,
          pId: true,
          payStatuses: { select: { status: true } },
        },
      });

      if (!order) {
        throw new GraphQLError("Order Does not Exist", {
          extensions: { statusCode: 404 },
        });
      }

      const payStatuses = order.payStatuses.map((s) => s.status);
      if (!payStatuses.includes(PaymentStatus.Paid)) {
        if (order.payMethod === PaymentType.Card) {
          const response = await axios.get<{
            data: { status: string };
          }>(`${consts.product.payment.validate}/${order.pId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.PAYMENT_SECRET}`,
            },
          });

          if (response.data.data.status !== "success") {
            throw new GraphQLError(
              helpers.getOrderPayMsg(PaymentStatus.Pending),
              {
                extensions: { statusCode: 400 },
              }
            );
          }
          await ctx.db.payStatus.create({
            data: { status: PaymentStatus.Paid, orderId: id },
          });
        } else {
          throw new GraphQLError(
            helpers.getOrderPayMsg(PaymentStatus.Pending),
            {
              extensions: { statusCode: 400 },
            }
          );
        }
      }

      return { message: helpers.getOrderPayMsg(PaymentStatus.Paid) };
    } catch (error) {
      helpers.error(error);
    }
  },
  InitializeOrderPay: async (_: any, { id }: { id: string }, ctx: Context) => {
    try {
      const order = await ctx.db.order.findUnique({
        where: {
          id: helpers.getValidId(id),
        },
        select: {
          payMethod: true,
          pId: true,
          totalAmount: true,
          user: { select: { email: true } },
          payStatuses: { select: { status: true } },
        },
      });

      if (!order) {
        throw new GraphQLError("Order Does not Exist", {
          extensions: { statusCode: 404 },
        });
      }

      const payStatuses = order.payStatuses.map((s) => s.status);
      const paymentTypes = helpers.getObjKeys<string>(PaymentType);

      if (order.payMethod !== PaymentType.Card) {
        throw new GraphQLError(
          `${paymentTypes[order.payMethod]
            .split("_")
            .join(" ")} payment method`,
          {
            extensions: { statusCode: 400 },
          }
        );
      }

      if (payStatuses.includes(PaymentStatus.Paid)) {
        throw new GraphQLError("Order has been paid for", {
          extensions: { statusCode: 400 },
        });
      }

      const response = await axios.post<InitPayment>(
        consts.product.payment.init,
        {
          email: order.user.email,
          amount: order.totalAmount,
          channels: consts.product.payment.channels,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PAYMENT_SECRET}`,
          },
        }
      );

      await ctx.db.order.update({
        where: { id },
        data: { pId: response.data.data.reference },
      });

      return { orderId: id, access_code: response.data.data.access_code };
    } catch (error) {
      helpers.error(error);
    }
  },
};
export default resolvers;
