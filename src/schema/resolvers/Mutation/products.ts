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
  ): Promise<ProductUpdateReturn> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    // validate data
    await validator.valProduct(data);

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

    try {
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
      console.log((error as any).message);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  UpdateProduct: async (
    _: any,
    { data }: { data: Product_I_U },
    ctx: Context
  ): Promise<ProductUpdateReturn> => {
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
                throw new GraphQLError(`${feature.name} feature is required`, {
                  extensions: { statusCode: 400 },
                });
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
              prevFeaturesId = prevFeaturesId.filter((prevId) => prevId !== id);
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
  },
  UpdateReview: async (_: any, { data }: { data: Review_I }, ctx: Context) => {
    middleware.checkUser(ctx);

    let prd = await ctx.db.product.findFirst({
      where: { id: data.prd_id },
      select: { id: true, reviews: { select: { rating: true, userId: true } } },
    });

    if (!prd?.id) {
      throw new GraphQLError(consts.errors.product.prdNotFound, {
        extensions: { statusCode: 404 },
      });
    }
    try {
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

      let totalRating = data.rating;
      const reviews = prd.reviews.filter((r) => r.userId !== ctx.user.id);
      reviews.forEach((r) => {
        totalRating += r.rating;
      });

      await ctx.db.product.update({
        where: { id: data.prd_id },
        data: {
          rating: Number((totalRating / (reviews.length + 1)).toFixed(1)),
        },
      });
      return { message: "Review Updated" };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  DeleteReview: async (
    _: any,
    { prd_id }: { prd_id: string },
    ctx: Context
  ) => {
    middleware.checkUser(ctx);
    let review = await ctx.db.reviews.findFirst({
      where: { userId: ctx.user.id, productId: prd_id },
      select: { id: true },
    });

    if (!review) {
      throw new GraphQLError("Review not found", {
        extensions: { statusCode: 400 },
      });
    }

    try {
      await ctx.db.reviews.delete({ where: { id: review.id } });
      return { message: "Review Deleted" };
    } catch (error) {
      throw new GraphQLError("Internal Server Error", {
        extensions: { statusCode: 500 },
      });
    }
  },
  CreateOrder: async (_: any, { data }: { data: Order_I }, ctx: Context) => {
    middleware.checkUser(ctx);

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
    } = await productsQuery.GetCartItems(null, {
      ids: data.itemIds,
      qtys: data.itemQtys,
    });

    let newOrderId = "";
    try {
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
            channel: consts.product.payment.channels,
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

      // const order = await ctx.db.order.create({
      //   data: {
      //     ...sumary,
      //     shippingAddress: data.shippingAddress,
      //     paymentMethod: data.paymentMethod,
      //     userId: ctx.user.id,
      //     pId,
      //   },
      // });
      // newOrderId = order.id;
      newOrderId = pId;

      // await ctx.db.orderItem.createMany({
      //   data: items.map((i) => ({
      //     orderId: order.id,
      //     productId: i.id,
      //     price: i.discountPrice,
      //     qty: i.qty,
      //   })),
      // });

      return { orderId: newOrderId, access_code };
    } catch (error) {
      console.log(error);
      if (newOrderId) {
        await ctx.db.order.delete({ where: { id: newOrderId } });
      }
      throw new GraphQLError("An error Occured while creating order", {
        extensions: { statusCode: 500 },
      });
    }
  },
  // UpdateOrder: async () => {},
};
export default resolvers;
