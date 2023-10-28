import { mutationField } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { GraphQLError } from "graphql";
import { validator } from "../../../helpers/validator";
import {
  ProductInput,
  UpdateProductCategoryInput,
  UpdateProductInfoInput,
} from "../inputs";
import { MessageObj, ProductMini } from "../objects";
import consts from "../../../@types/conts";
import { getSKU } from "../../../helpers";
import { isEqual } from "lodash";

export const CreateProduct = mutationField("CreateProduct", {
  type: ProductMini,
  args: { data: ProductInput },
  resolve: async (_, { data }, ctx) => {
    // check if logged_in
    middleware.checkAdmin(ctx);

    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.valProduct(data);

    // check if product category exist
    const productCat = await ctx.db.category.findUnique({
      where: { cId: data.cId },
      select: {
        hasWarranty: true,
        hasMfg: true,
        filters: {
          select: { isRequired: true, id: true, name: true, options: true },
        },
        brand: { select: { name: true } },
      },
    });

    if (!productCat) {
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

    if (
      (productCat.brand?.name && productCat.brand.name !== productBrd.name) ||
      !productBrd
    ) {
      throw new GraphQLError("Invalid brand name", {
        extensions: { statusCode: 404 },
      });
    }

    // add warranty if required in category
    if (productCat.hasWarranty && !data?.warranty) {
      throw new GraphQLError("Product warranty is required", {
        extensions: { statusCode: 404 },
      });
    }

    // add warranty if required in category
    if (productCat.hasMfg && (!data?.mfgCountry || !data.mfgDate)) {
      throw new GraphQLError("Manufacturing Details required is required", {
        extensions: { statusCode: 404 },
      });
    }

    // Category filters
    const filtersData: {
      productId: string;
      optionId: string;
      values: string[];
    }[] = [];

    productCat.filters.map(({ isRequired, id, name, options }) => {
      const filterData = data.filters?.find((f) => f.optionId === id);

      if (isRequired && !filterData) {
        throw new GraphQLError(`${name} filter is required`, {
          extensions: { statusCode: 404 },
        });
      }

      if (!isEqual(options, filterData?.values)) {
        throw new GraphQLError("Use Options provided by Filter", {
          extensions: { statusCode: 404 },
        });
      }

      if (filterData) {
        filtersData.push({ ...filterData, productId: "" });
      }
    });

    // validate image/
    const images = await validator.files(
      data.images,
      consts.files.product.min,
      consts.files.product.max
    );

    // create sku
    const sku = getSKU(
      data.name,
      data.brand,
      data.price,
      data.colors,
      data.cId
    );

    try {
      // add category
      const newPrd = await ctx.db.product.create({
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
          warrCovered: data?.warranty?.covered || undefined,
          warrDuration: data?.warranty?.duration || undefined,
          payment: data.payment as any,
          colors: data.colors,
          mfgCountry: data?.mfgCountry || undefined,
          mfgDate: data?.mfgDate || undefined,
        },
        select: {
          id: true,
          name: true,
          price: true,
          category: { select: { name: true } },
          brand: { select: { name: true } },
          rating: true,
        },
      });

      if (filtersData.length) {
        await ctx.db.categoryFilterValue.createMany({
          data: filtersData.map((f) => ({ ...f, optionId: newPrd.id })),
        });
      }

      return {
        ...newPrd,
        brand: newPrd.brand.name,
        category: newPrd.category.name,
        images: [],
        discount: 0,
      };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
    }
  },
});

export const UpdateProductCategory = mutationField("UpdateProductCategory", {
  type: MessageObj,
  args: { data: UpdateProductCategoryInput },
  resolve: async (_, { data }, ctx) => {
    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.valProductFilters(data.filters);

    const product = await ctx.db.product.findUnique({
      where: { id: data.pId },
      select: {
        id: true,
        category: {
          select: {
            id: true,
            filters: { select: { id: true, isRequired: true, name: true } },
          },
        },
        filters: { select: { id: true, optionId: true } },
      },
    });

    if (!product) {
      throw new GraphQLError("Product not found", {
        extensions: { statusCode: 400 },
      });
    }

    let prevFilterIds = product.filters.map((f) => f.id);
    if (data.cId !== product.category.id) {
      // check if product category exist
      const productCat = await ctx.db.category.findUnique({
        where: { id: data.cId },
        select: {
          hasWarranty: true,
          hasMfg: true,
          filters: {
            select: {
              isRequired: true,
              id: true,
              name: true,
            },
          },
          brand: { select: { name: true } },
        },
      });

      if (!productCat) {
        throw new GraphQLError("Product Category not found", {
          extensions: { statusCode: 404 },
        });
      }

      await ctx.db.categoryFilterValue.deleteMany({
        where: { id: { in: product.filters.map((f) => f.id) } },
      });

      // Category filters
      const filtersData: {
        productId: string;
        optionId: string;
        values: string[];
      }[] = [];
      await Promise.all(
        productCat.filters.map(async ({ isRequired, id, name }) => {
          const filterData = data.filters?.find((f) => f.optionId === id);

          if (isRequired && !filterData) {
            throw new GraphQLError(`${name} filter is required`, {
              extensions: { statusCode: 400 },
            });
          }

          if (filterData) filtersData.push({ ...filterData, productId: "" });
        })
      );

      if (filtersData.length) {
        await ctx.db.categoryFilterValue.createMany({
          data: filtersData.map((f) => ({ ...f, optionId: product.id })),
        });
      }

      // delete filter not modified
      if (prevFilterIds.length) {
        await ctx.db.categoryFilter.deleteMany({
          where: { id: { in: prevFilterIds } },
        });
      }
    } else {
      await validator.valProductFilters(data);
      if (prevFilterIds.length && !data.filters?.length) {
        const hasRequiredFilter =
          product.category.filters.findIndex((f) => !f.isRequired) !== -1;
        if (!hasRequiredFilter) {
          await ctx.db.categoryFilterValue.deleteMany({
            where: { id: { in: prevFilterIds } },
          });
        } else {
          throw new GraphQLError("Cannot delete all filters", {
            extensions: { statusCode: 400 },
          });
        }
      } else if (data?.filters?.length) {
        await Promise.all(
          product.category.filters.map(async ({ isRequired, id, name }) => {
            const filterData = data.filters?.find((f) => f.optionId === id);

            if (isRequired && !filterData) {
              throw new GraphQLError(`${name} filter is required`, {
                extensions: { statusCode: 404 },
              });
            }

            if (filterData) {
              prevFilterIds = prevFilterIds.filter(
                (id) => filterData?.id !== id
              );

              await ctx.db.categoryFilterValue.upsert({
                where: { id },
                create: { ...filterData, productId: data.pId, id: undefined },
                update: { ...filterData, productId: data.pId },
              });
            }
          })
        );

        // delete filter not modified
        if (prevFilterIds.length) {
          await ctx.db.categoryFilter.deleteMany({
            where: { id: { in: prevFilterIds } },
          });
        }
      }
    }

    return { message: "Product Updated" };
  },
});

export const UpdateProductInfo = mutationField("UpdateProductInfo", {
  type: MessageObj,
  args: { data: UpdateProductInfoInput },
  resolve: async (_, { data }, ctx) => {
    if (!data) {
      throw new GraphQLError("No data provided", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.valProductInfo(data);

    const product = await ctx.db.product.findUnique({
      where: { id: data.id },
      select: {
        images: true,
        category: {
          select: {
            hasMfg: true,
            hasWarranty: true,
            brand: { select: { name: true, id: true } },
          },
        },
        brand: { select: { name: true, id: true } },
      },
    });
    if (!product) {
      throw new GraphQLError("Product not found", {
        extensions: { statusCode: 400 },
      });
    }

    // check if product brand exist
    let brdId: string | null = product.brand.id;
    if (data?.brand && data?.brand !== product.brand.name) {
      const brand = await ctx.db.brand.findUnique({
        where: { name: data.brand },
      });

      if (
        !brand ||
        (product.category?.brand?.name &&
          product.category?.brand?.name !== brand.name)
      ) {
        throw new GraphQLError("Invalid brand name", {
          extensions: { statusCode: 400 },
        });
      }
      brdId = brand.id;
    }

    // add warranty if required in category
    if (product.category.hasWarranty && !data?.warranty) {
      throw new GraphQLError("Product warranty is required", {
        extensions: { statusCode: 400 },
      });
    }

    // add warranty if required in category
    if (product.category.hasMfg && (!data.mfgCountry || !data.mfgDate)) {
      throw new GraphQLError("Manufacturing Details required", {
        extensions: { statusCode: 400 },
      });
    }

    let images = product.images;
    images = await validator.files(
      data.images,
      consts.files.product.min,
      consts.files.product.max,
      product.images
    );

    const newPrd = await ctx.db.product.update({
      where: { id: data.id },
      data: {
        name: data?.name || undefined,
        description: data?.description || undefined,
        price: typeof data?.price === "number" ? data?.price : undefined,
        count: typeof data?.count === "number" ? data.count : undefined,
        discount:
          typeof data.discount === "number"
            ? data.discount
            : undefined || undefined,
        images,
        warrCovered: data?.warranty?.covered || undefined,
        warrDuration: data?.warranty?.duration || undefined,
        payment: data.payment as any,
        colors: data?.colors || undefined,
        mfgCountry: data?.mfgCountry || undefined,
        mfgDate: data?.mfgDate || undefined,
      },
      select: {
        brand: { select: { name: true } },
        name: true,
        price: true,
        colors: true,
        cId: true,
      },
    });

    // create sku
    const sku = getSKU(
      newPrd.name,
      newPrd.brand.name,
      newPrd.price,
      newPrd.colors,
      newPrd.cId
    );
    await ctx.db.product.update({ where: { id: data.id }, data: { sku } });

    return { message: "Product Updated" };
  },
});
