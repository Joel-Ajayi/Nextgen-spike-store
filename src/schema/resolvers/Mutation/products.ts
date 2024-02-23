import { GraphQLError } from "graphql";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import middleware from "../../../middlewares/middlewares";
import {
  Product_I_U,
  Product_I,
  ProductUpdateReturn,
} from "../../../@types/products";
import { validator } from "../../../helpers/validator";
import { getSKU } from "../../../helpers";
import { Types } from "mongoose";
import { CategoryFeature } from "../../../@types/categories";
import { upload } from "../../../helpers/uploads";

const resolvers = {
  CreateProduct: async (
    _: any,
    { data }: { data: Product_I },
    ctx: Context
  ): Promise<ProductUpdateReturn> => {
    // check if logged_in
    middleware.checkAdmin(ctx);

    // validate data
    await validator.valProduct(data);

    // check if product category exist
    const productCategory = await ctx.db.category.findUnique({
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
    const productBrd = await ctx.db.brand.findUnique({
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
          const parentCategory = await ctx.db.category.findUnique({
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
    // filter features to get only features without sub features
    features = features.filter(
      (feature) => features.findIndex((f) => f.parentId === feature.id) === -1
    );

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
    const sku = getSKU(
      data.name,
      data.brand,
      data.price,
      data.colours,
      data.cId
    );

    try {
      // add category
      const newProduct = await ctx.db.product.create({
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
          colours: data.colours,
          mfgDate: data?.mfgDate,
        },
      });

      // add features
      const productFeatures = await Promise.all(
        data.features.map(async (f) => {
          const data = { ...f, productId: newProduct.id };
          const newFeature = await ctx.db.productFeature.create({
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
    const product = await ctx.db.product.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        images: true,
        category: {
          select: {
            cId: true,
            parent: { select: { name: true, id: true } },
            hasWarrantyAndProduction: true,
            features: true,
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
      : await ctx.db.category.findUnique({
          where: { cId: isNewCategory ? data.cId : product.category.cId },
          select: {
            cId: true,
            parent: { select: { name: true, id: true } },
            hasWarrantyAndProduction: true,
            features: true,
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
      let features = [
        ...category.features,
        // get features of parent category
        ...(await (async function getFeatures(
          parentCatName = ""
        ): Promise<CategoryFeature[]> {
          if (parentCatName) {
            const parentCategory = await ctx.db.category.findUnique({
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
        })(category.parent?.name)),
      ];
      // filter features to get only features without sub features
      features = features.filter(
        (feature) => features.findIndex((f) => f.parentId === feature.id) === -1
      );

      const inputFeatureIds = data.features.map(({ featureId }) => featureId);
      features.forEach(({ id, name }) => {
        if (!inputFeatureIds.includes(id)) {
          throw new GraphQLError(`${name} feature is required`, {
            extensions: { statusCode: 404 },
          });
        }
      });
    }

    // update product brand
    let brdId: string | undefined = undefined;
    if (data?.brand && data?.brand !== product.brand.name) {
      const brand = await ctx.db.brand.findUnique({
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

    const newPrd = await ctx.db.product.update({
      where: { id: data.id },
      data: {
        name: data?.name || undefined,
        cId: typeof data?.price === "number" ? data?.cId : undefined,
        description: data?.description || undefined,
        price: typeof data?.price === "number" ? data?.price : undefined,
        count: typeof data?.count === "number" ? data.count : undefined,
        discount:
          typeof data?.discount === "number" ? data?.discount : undefined,
        paymentType:
          typeof data.paymentType === "number" ? data.paymentType : undefined,
        colours: data?.colours || undefined,
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
      if (isNewCategory) {
        await ctx.db.productFeature.deleteMany({
          where: { id: { in: product.features.map((f) => f.id) } },
        });
      }

      // create new features
      productFeatures = await Promise.all(
        data.features.map(async ({ id: inputFeatureId, ...inputFeature }) => {
          const randObjId = new Types.ObjectId().toString();
          const id = isNewCategory ? randObjId : inputFeatureId || randObjId;
          const featureData = { ...inputFeature, productId: data.id };

          return await ctx.db.productFeature.upsert({
            where: { id },
            create: featureData,
            update: featureData,
          });
        })
      );
    }

    // create sku
    const sku = getSKU(
      newPrd.name,
      data.brand || product.brand.name,
      newPrd.price,
      newPrd.colours,
      newPrd.cId
    );
    await ctx.db.product.update({ where: { id: data.id }, data: { sku } });

    return { id: newPrd.id, sku, features: productFeatures };
  },
};
export default resolvers;
