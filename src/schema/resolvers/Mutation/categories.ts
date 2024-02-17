import { GraphQLError } from "graphql";
import { Types } from "mongoose";

import consts from "../../../@types/conts";
import {
  CategoryFeature,
  CategoryMini,
  CategoryOfferType,
  CategoryOffer,
  Category_I,
  Category_I_U,
} from "../../../@types/categories";
import { Context } from "../../context";
import middleware from "../../../middlewares/middlewares";
import { validator } from "../../../helpers/validator";
import { FileUpload } from "graphql-upload/Upload";
import { getObjKeys } from "../../../helpers";

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
    await validator.category(data as any);

    // check if already added
    const addedCat = await ctx.db.category.findUnique({
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
      parent = await ctx.db.category.findUnique({
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
      const brand = await ctx.db.brand.findUnique({
        where: { name: data.brand },
      });
      if (!brand) {
        throw new GraphQLError("Brand not found", {
          extensions: { statusCode: 404 },
        });
      }
      brandId = brand.id;
    }

    try {
      // validate image/
      let image: string | null | undefined = "";
      if (data?.image) image = (await validator.files([data.image], 0))[0];

      // waranty and production
      const hasWarrantyAndProduction =
        parent?.hasWarrantyAndProduction || data.hasWarrantyAndProduction;

      // validate offers banner
      const offerTypes = getObjKeys<string>(CategoryOfferType);
      const offersBanner = await validator.files(
        data.offers.map((f) => f.banner) as Promise<FileUpload>[],
        0,
        offerTypes.length,
        []
      );

      const catCount = (await ctx.db.category.count()) + 1;
      // add category
      const newCat = await ctx.db.category.create({
        data: {
          name: data.name,
          lvl: !!parent ? parent.lvl + 1 : 1,
          cId: catCount,
          description: data.description,
          image,
          brdId: brandId,
          hasWarrantyAndProduction,
          parentId: !parent?.id ? undefined : parent.id,
        },
        select: {
          id: true,
          name: true,
          lvl: true,
          cId: true,
          image: true,
          hasWarrantyAndProduction: true,
          parent: { select: { name: true } },
          features: true,
          offers: true,
        },
      });

      // Features
      if (data.features?.length) {
        const parentFeatures = data.features
          .filter((f) => !f?.parentId)
          .map((f) => ({ ...f, categoryId: newCat.id }));

        await (async function saveFeature(pFeatures: CategoryFeature[]) {
          await Promise.all(
            pFeatures.map(async ({ categoryId, ...rest }) => {
              // save feature
              let feature = { categoryId, ...rest };
              feature = await ctx.db.categoryFeature.create({ data: feature });

              // get feature children
              const children = data.features
                .filter((child) => child.parentId === feature.name)
                .map((f) => ({ ...f, categoryId, parentId: feature.id }));

              // save feature children
              if (children.length) await saveFeature(children);
            })
          );
        })(parentFeatures);
      }

      const offers: CategoryOffer[] = [];
      if (data.offers.length) {
        await Promise.all(
          data.offers.map(async ({ id, ...offerInput }, i) => {
            const data = {
              ...offerInput,
              banner: offersBanner[i],
              categoryId: newCat.id,
            };
            offers.push(await ctx.db.categoryOffer.create({ data }));
          })
        );
      }

      return { ...newCat, parent: newCat.parent?.name || "", offers };
    } catch (error) {
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
    await validator.category(data as any, true);

    // check if cat exist
    const category = await ctx.db.category.findUnique({
      where: { id: data?.id },
      select: {
        id: true,
        lvl: true,
        image: true,
        brdId: true,
        brand: { select: { name: true } },
        parent: { select: { hasWarrantyAndProduction: true } },
        features: { select: { id: true, parentId: true } },
        offers: true,
      },
    });
    if (!category) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }

    // check if cat exist
    const searchedCat = await ctx.db.category.findUnique({
      where: { name: data?.name },
      select: { id: true },
    });

    if (!!searchedCat && category.id !== searchedCat?.id) {
      if (!category) {
        throw new GraphQLError("Category Name already used", {
          extensions: { statusCode: 404 },
        });
      }
    }

    // check if brand exist
    let brandId: string | null = category.brdId;
    if (data.brand && data.brand !== category.brand?.name) {
      const brand = await ctx.db.brand.findUnique({
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

    // delete all filters
    let prevFeaturesId = [...category.features].map((f) => f.id);
    if (data.features?.length) {
      // Features
      const parentFeatures = data.features.filter((f) => !f.parentId);
      const ObjectId = Types.ObjectId;

      await (async function saveFeature(pFeatures: CategoryFeature[]) {
        const randObjId = new ObjectId().toString();
        await Promise.all(
          pFeatures.map(async ({ id, parentId, ...rest }) => {
            const isIdValid =
              ObjectId.isValid(id) && String(new ObjectId(id)) === id;

            // save feature
            const featureData = {
              categoryId: category.id,
              ...rest,
              parentId: parentId || null,
            };
            const feature = await ctx.db.categoryFeature.upsert({
              where: { id: isIdValid ? id : randObjId },
              create: featureData,
              update: featureData,
            });
            prevFeaturesId = prevFeaturesId.filter((fId) => fId !== id);

            // get feature children
            const children = data.features
              .filter((child) => child.parentId === id)
              .map((f) => ({ ...f, parentId: feature.id }));

            // save feature children
            if (children.length) await saveFeature(children);
          })
        );
      })(parentFeatures);
    }
    // delete filter not modified
    if (prevFeaturesId.length) {
      await ctx.db.categoryFeature.deleteMany({
        where: { id: { in: prevFeaturesId } },
      });
    }

    // validate image
    const dataImage = data?.image ? [data?.image] : [];
    const prevImage = !!category?.image ? [category.image] : [];
    const image = (await validator.files(dataImage, 0, 1, prevImage))[0];
    const offerTypes = getObjKeys<string>(CategoryOfferType);

    // validate offers banner
    const offersBanner = await validator.files(
      data.offers.map((f) => f.banner) as Promise<FileUpload>[],
      0,
      offerTypes.length,
      category.offers.map((f) => f.banner)
    );

    if (data.offers) {
      await Promise.all(
        data.offers.map(async ({ id, ...offerInput }, i) => {
          const ObjectId = Types.ObjectId;
          const isIdValid =
            ObjectId.isValid(id) && String(new ObjectId(id)) === id;
          const ObjId = isIdValid ? id : new ObjectId().toString();

          const data = {
            ...offerInput,
            banner: offersBanner[i],
            categoryId: category.id,
          };

          await ctx.db.categoryOffer.upsert({
            where: { id: ObjId },
            create: data,
            update: data,
          });
        })
      );
    }

    const hasWarrantyAndProduction =
      category?.parent?.hasWarrantyAndProduction ||
      data.hasWarrantyAndProduction;

    const updatedCategory = await ctx.db.category.update({
      where: { id: category.id },
      data: {
        name: data.name,
        description: data.description,
        image,
        brdId: brandId,
        hasWarrantyAndProduction,
      },
      select: {
        id: true,
        name: true,
        lvl: true,
        cId: true,
        parent: { select: { name: true } },
        hasWarrantyAndProduction: true,
        features: true,
        offers: true,
      },
    });

    if (updatedCategory === null) {
      throw new GraphQLError("Category not found", {
        extensions: { statusCode: 404 },
      });
    }
    return { ...updatedCategory, parent: updatedCategory.parent?.name || "" };
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
    const addedCat = await ctx.db.category.findUnique({
      where: { name },
      select: {
        name: true,
        id: true,
        lvl: true,
        cId: true,
        hasWarrantyAndProduction: true,
        features: true,
        offers: true,
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
      catParent = await ctx.db.category.findUnique({
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

      const categories = await ctx.db.category.findMany({
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

    await ctx.db.category.update({
      where: { id: addedCat.id },
      data: {
        parentId: catParent ? catParent.id : null,
        lvl: catParent ? catParent.lvl + 1 : 1,
        hasWarrantyAndProduction:
          catParent?.hasWarrantyAndProduction ||
          addedCat.hasWarrantyAndProduction,
      },
    });
    return { ...addedCat, parent: catParent?.name || "" };
  },
};

export default resolvers;
