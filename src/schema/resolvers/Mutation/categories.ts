import { GraphQLError } from "graphql";
import { Types } from "mongoose";

import consts from "../../../@types/conts";
import {
  CategoryFeature,
  CategoryMini,
  CategoryOffer,
  CategoryOfferType,
  Category_I,
  Category_I_U,
} from "../../../@types/categories";
import { Context } from "../../context";
import middleware from "../../../middlewares/middlewares";
import { validator } from "../../../helpers/validator";
import { ValidateFileProps, upload } from "../../../helpers/uploads";
import helpers from "../../../helpers";
import { db } from "../../../db/prisma/connect";

const ObjectId = Types.ObjectId;

const resolvers = {
  CreateCategory: async (
    _: any,
    { data }: { data: Category_I },
    ctx: Context
  ): Promise<CategoryMini> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.category(data);

    // check if already added
    const addedCat = await db.category.findUnique({
      where: { name: data?.name },
      select: { id: true },
    });
    if (addedCat) {
      throw new GraphQLError("Category name already used", {
        extensions: { statusCode: 400 },
      });
    }

    // check parent
    let parent: {
      lvl: number;
      id: string;
      hasWarrantyAndProduction: boolean;
    } | null = null;
    if (data?.parent) {
      parent = await db.category.findUnique({
        where: { name: data.parent },
        select: {
          id: true,
          lvl: true,
          hasWarrantyAndProduction: true,
          features: true,
        },
      });
      if (!parent) {
        throw new GraphQLError("Parent category does not exist", {
          extensions: { statusCode: 404 },
        });
      }
    }

    // check if brand exist
    let brandId: string | null = null;
    if (data?.brand) {
      const brand = await db.brand.findUnique({
        where: { name: data.brand },
      });
      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }
      brandId = brand.id;
    }

    const fileOptions = {
      folder: "cat",
      files: [],
      maxNum: 1,
      minNum: 0,
      prevFiles: [],
      removeBg: true,
    } as ValidateFileProps;

    // validate category icon
    let icon: string | undefined = undefined;
    if (data.icon) {
      const format = consts.files.mimeType.supportedImg[0];
      icon = (
        await upload.files({
          ...fileOptions,
          removeBg: false,
          format,
          files: [data.icon],
        })
      )[0];
    }

    // validate offers image
    let offersFileNames: string[] = [];
    if (data.offers.length) {
      const files = data.offers.filter((f) => !!f.image).map((f) => f.image);
      offersFileNames = await upload.files({
        ...fileOptions,
        minNum: data.offers.length,
        maxNum: data.offers.length,
        files,
      });
    }

    // validate banner image
    let bannerFileName = "";
    if (data.banner) {
      const image = data.banner.image;
      bannerFileName = (
        await upload.files({ ...fileOptions, files: [image], minNum: 1 })
      )[0];
    }

    try {
      // waranty and production
      const hasWarrantyAndProduction =
        parent?.hasWarrantyAndProduction || data.hasWarrantyAndProduction;

      const catCount = (await db.category.count()) + 3;
      // add category
      const newCategory = await db.category.create({
        data: {
          name: data.name,
          icon,
          lvl: !!parent ? parent.lvl + 1 : 1,
          cId: catCount,
          description: data.description,
          brdId: brandId,
          hasWarrantyAndProduction,
          parentId: parent?.id,
        },
        select: {
          id: true,
          name: true,
          lvl: true,
          icon: true,
          numSold: true,
          cId: true,
          hasWarrantyAndProduction: true,
          parent: { select: { name: true } },
          banner: true,
        },
      });

      if (bannerFileName) {
        const bannerData = {
          ...data.banner,
          image: bannerFileName,
          categoryId: newCategory.id,
        };
        await db.categoryBanner.create({ data: bannerData });
      }

      // Features
      const features: CategoryFeature[] = [];
      if (data.features?.length) {
        await Promise.all(
          data.features.map(async ({ ...rest }) => {
            // save feature
            const categoryId = newCategory.id;
            let feature = { categoryId, ...rest };
            feature = await db.categoryFeature.create({ data: feature });
            features.push(feature);
          })
        );
      }

      const offers: CategoryOffer[] = [];
      if (data.offers.length) {
        await Promise.all(
          data.offers.map(async ({ id, ...offerInput }, i) => {
            const data = {
              ...offerInput,
              image: offersFileNames[i],
              categoryId: newCategory.id,
            };

            offers.push(await db.categoryOffer.create({ data }));
          })
        );
      }

      return {
        ...newCategory,
        icon: newCategory.icon || "",
        banner: null,
        parent: newCategory.parent?.name || "",
        offers,
        features,
      };
    } catch (error) {
      console.log(error);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  UpdateCategory: async (
    _: any,
    { data }: { data: Category_I_U },
    ctx: Context
  ): Promise<CategoryMini> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }
    // validate data
    await validator.category(data, true);

    // check if cat exist
    const category = await db.category.findUnique({
      where: { id: data?.id },
      select: {
        id: true,
        lvl: true,
        brdId: true,
        icon: true,
        brand: { select: { name: true } },
        parent: { select: { hasWarrantyAndProduction: true } },
        features: { select: { id: true, parentId: true } },
        banner: true,
        offers: true,
      },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    // check if cat exist
    const searchedCat = await db.category.findUnique({
      where: { name: data?.name },
      select: { id: true },
    });

    if (!!searchedCat && category.id !== searchedCat?.id) {
      throw new GraphQLError("Category Name already used", {
        extensions: { statusCode: 404 },
      });
    }

    // check if brand exist
    let brandId: string | null = category.brdId;
    if (data.brand && data.brand !== category.brand?.name) {
      const brand = await db.brand.findUnique({
        where: { name: data.brand },
      });
      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }
      brandId = brand.id;
    } else if (!data.brand) {
      brandId = null;
    }

    const fileOptions = {
      folder: "cat",
      files: [],
      maxNum: 1,
      minNum: 0,
      prevFiles: [],
      removeBg: true,
    } as ValidateFileProps;

    // validate category icon
    let icon: string | null | undefined = null;
    if (data.icon) {
      // if image url
      if (typeof data.icon === "string") {
        icon = undefined;
      } else {
        // if image file
        const format = consts.files.mimeType.supportedImg[0];
        const prevFiles = category.icon ? [category.icon] : [];
        icon = (
          await upload.files({
            ...fileOptions,
            prevFiles,
            files: [data.icon],
            removeBg: false,
            format,
          })
        )[0];
      }
    } else if (category.icon) {
      await upload.deleteFiles([category.icon]);
    }

    // validate banner image
    // if image file
    let bannerFileName: string | undefined = undefined;
    if (data.banner) {
      // if image file
      if (typeof data.banner.image !== "string") {
        const prevImage = category.banner[0]?.image;
        const image = data.banner.image;
        const files = !image ? [] : [image];
        const prevFiles = !prevImage ? [] : [prevImage];
        bannerFileName = (
          await upload.files({ ...fileOptions, files, prevFiles, minNum: 1 })
        )[0];
      }
    }

    // validate offers image
    let offersImages: string[] = [];
    if (data.offers.length) {
      const offerTypes = helpers.getObjKeys<string>(CategoryOfferType);
      const files = data.offers.map((f) => f.image);
      const prevFiles = category.offers.map((f) => f.image);
      offersImages = await upload.files({
        ...fileOptions,
        files,
        prevFiles,
        minNum: 1,
        maxNum: offerTypes.length,
      });
    }

    const hasWarrantyAndProduction =
      category?.parent?.hasWarrantyAndProduction ||
      data.hasWarrantyAndProduction;
    try {
      // delete all features
      let prevFeaturesId = [...category.features].map((f) => f.id);
      if (data.features?.length) {
        // Features
        const ObjectId = Types.ObjectId;
        const randObjId = new ObjectId().toString();
        await Promise.all(
          data.features.map(async ({ id, ...rest }) => {
            const isIdValid =
              ObjectId.isValid(id) && String(new ObjectId(id)) === id;
            // save feature
            const featureData = { categoryId: category.id, ...rest };
            const feature = await db.categoryFeature.upsert({
              where: { id: isIdValid ? id : randObjId },
              create: featureData,
              update: featureData,
            });
            prevFeaturesId = prevFeaturesId.filter((fId) => fId !== id);
          })
        );
      }
      // delete features not modified
      if (prevFeaturesId.length) {
        await db.categoryFeature.deleteMany({
          where: { id: { in: prevFeaturesId } },
        });
      }

      let prevOffers = [...category.offers];
      if (data.offers.length) {
        for (let index = 0; index < data.offers.length; index++) {
          const { id, ...offerInput } = data.offers[index];

          // const element = array[index];
          const isValidId =
            ObjectId.isValid(id) && String(new ObjectId(id)) === id;
          const ObjId = isValidId ? id : new ObjectId().toString();
          const inputData = {
            ...offerInput,
            image: offersImages[index],
            categoryId: category.id,
          };

          await db.categoryOffer.upsert({
            where: { id: ObjId },
            create: inputData,
            update: inputData,
          });
          prevOffers = prevOffers.filter((f) => f.id !== ObjId);
        }
      }
      // delete offfers not modified
      if (prevOffers.length) {
        const prevIds: string[] = [];
        const prevImages: string[] = [];
        prevOffers.forEach((f) => {
          prevIds.push(f.id);
          prevImages.push(f.image);
        });
        await db.categoryOffer.deleteMany({
          where: { id: { in: prevIds } },
        });
        await upload.deleteFiles(prevImages);
      }

      if (data.banner) {
        const bannerData = {
          ...data.banner,
          image: bannerFileName,
          categoryId: category.id,
        };

        const id = category.banner[0]?.id || new ObjectId().toString();
        await db.categoryBanner.upsert({
          where: { id },
          create: { ...bannerData, image: bannerFileName || "" },
          update: bannerData,
        });
      } else if (category.banner[0]) {
        await db.categoryBanner.delete({
          where: { id: category.banner[0].id },
        });
        await upload.deleteFiles([category.banner[0].image]);
      }

      const updatedCategory = await db.category.update({
        where: { id: category.id },
        data: {
          icon,
          name: data.name,
          description: data.description,
          brdId: brandId,
          hasWarrantyAndProduction,
        },
        select: {
          id: true,
          name: true,
          lvl: true,
          cId: true,
          icon: true,
          parent: { select: { name: true } },
          hasWarrantyAndProduction: true,
          features: true,
          offers: true,
          numSold: true,
        },
      });

      if (updatedCategory === null) {
        throw new GraphQLError("Category not found", {
          extensions: { statusCode: 404 },
        });
      }
      return {
        ...updatedCategory,
        icon: updatedCategory.icon || "",
        banner: null,
        parent: updatedCategory.parent?.name || "",
      };
    } catch (error) {
      console.log(error);
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
  UpdateCategoryParent: async (
    _: any,
    { name, parent }: { name: string; parent: string },
    ctx: Context
  ): Promise<CategoryMini> => {
    // check if logged_in
    middleware.checkSuperAdmin(ctx);

    // validate data
    await validator.categoryParent(name, parent);

    // check if cat exist
    const addedCat = await db.category.findUnique({
      where: { name },
      select: {
        name: true,
        id: true,
        lvl: true,
        cId: true,
        icon: true,
        hasWarrantyAndProduction: true,
        features: true,
        offers: true,
        numSold: true,
      },
    });

    if (!addedCat) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    let catParent: {
      name: string;
      id: string;
      lvl: number;
      cId: number;
      hasWarrantyAndProduction: boolean;
    } | null = null as any;

    if (parent) {
      // check parent
      catParent = await db.category.findUnique({
        where: { name: parent },
        select: {
          id: true,
          lvl: true,
          cId: true,
          name: true,
          hasWarrantyAndProduction: true,
        },
      });

      if (!catParent) {
        throw new GraphQLError("Parent category does not exist", {
          extensions: { statusCode: 404 },
        });
      }

      if (catParent?.id === addedCat.id) {
        throw new GraphQLError("Sorry, you can't add to this category", {
          extensions: { statusCode: 400 },
        });
      }

      const categories = await db.category.findMany({
        select: { id: true, parent: { select: { id: true } } },
      });

      const categoriesLinage = categories
        .filter((cat) => !cat.parent?.id)
        .map(({ id }) => [id]);

      categoriesLinage.forEach((id, i) => {
        (function pushToTree(parent: string, index: number) {
          categories
            .filter((cat) => cat.parent?.id === parent)
            .forEach((child) => {
              categoriesLinage[index].push(child.id);
              pushToTree(child.id, index);
            });
        })(id[0], i);
      });

      const parentLineIndex = categoriesLinage.findIndex(
        (line) => line.findIndex((id) => id === catParent?.id) !== -1
      );
      const categoryLineIndex = categoriesLinage.findIndex(
        (line) => line.findIndex((id) => id === addedCat.id) !== -1
      );

      if (
        parentLineIndex === categoryLineIndex &&
        catParent.lvl > addedCat.lvl
      ) {
        throw new GraphQLError("Sorry, you can't add to this category", {
          extensions: { statusCode: 400 },
        });
      }
    }

    await db.category.update({
      where: { id: addedCat.id },
      data: {
        parentId: catParent ? catParent.id : null,
        lvl: catParent ? catParent.lvl + 1 : 1,
        hasWarrantyAndProduction:
          catParent?.hasWarrantyAndProduction ||
          addedCat.hasWarrantyAndProduction,
      },
    });
    return {
      ...addedCat,
      icon: addedCat.icon || "",
      banner: null,
      parent: catParent?.name || "",
    };
  },
};

export default resolvers;
