import { SearchRes, SearchResType as SearchResultType } from "../../../@types";
import { CategoryBanner } from "../../../@types/categories";
import { db } from "../../../db/prisma/connect";
import helpers from "../../../helpers";

export default {
  LandingPageData: async (_: any) => {
    const offers = await db.categoryOffer.findManyRandom(10, {
      select: {
        id: true,
        tagline: true,
        image: true,
        bannerColours: true,
        audience: true,
        validUntil: true,
        type: true,
        discount: true,
      },
    });
    const count = 10 - offers.length;

    let banners: CategoryBanner[] = [];
    if (count !== 10) {
      banners = await db.categoryBanner.findManyRandom(count, {
        select: { id: true, tagline: true, image: true, bannerColours: true },
      });
    }

    const topCategories = (
      await db.category.findMany({
        orderBy: { numSold: "desc" },
        select: {
          id: true,
          name: true,
          lvl: true,
          cId: true,
          icon: true,
          numSold: true,
          hasWarrantyAndProduction: true,
        },
        take: 12,
      })
    ).map((c) => ({
      ...c,
      icon: c.icon as string,
      offers: [],
      banner: null,
      features: [],
      parent: "",
    }));

    const selectProduct = {
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
    };

    const newProducts = (
      await db.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: selectProduct,
      })
    ).map((p) => ({
      ...p,
      brand: p.brand.name,
      features: [],
      numReviews: p.reviews.length,
      reviews: undefined,
      category: p.category?.name || "",
    }));

    const popularProducts = (
      await db.product.findMany({
        orderBy: [
          { rating: "desc" },
          { numSold: "desc" },
          { reviews: { _count: "desc" } },
        ],
        take: 6,
        select: selectProduct,
      })
    ).map((p) => ({
      ...p,
      brand: p.brand.name,
      features: [],
      numReviews: p.reviews.length,
      reviews: undefined,
      category: p.category?.name || "",
    }));

    const hotDeals = (
      await db.product.findMany({
        where: {
          OR: [
            { discount: { gt: 0 } },
            { category: { offers: { every: { id: { not: undefined } } } } },
          ],
        },
        orderBy: { discount: "desc" },
        take: 6,
        select: selectProduct,
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
      topCategories,
      banners,
      newProducts: [
        newProducts[0],
        newProducts[0],
        newProducts[0],
        newProducts[0],
      ],
      popularProducts: [
        popularProducts[0],
        popularProducts[0],
        popularProducts[0],
        popularProducts[0],
      ],
      hotDeals: [hotDeals[0], hotDeals[0], hotDeals[0], hotDeals[0]],
    };
  },
  HeaderData: async () => {
    const topCategories = (
      await db.category.findMany({
        orderBy: { numSold: "desc" },
        select: {
          id: true,
          name: true,
          lvl: true,
          cId: true,
          icon: true,
          numSold: true,
          hasWarrantyAndProduction: true,
        },
        take: 12,
      })
    ).map((c) => ({
      ...c,
      icon: c.icon as string,
      offers: [],
      banner: null,
      features: [],
      parent: "",
    }));

    const categories = (
      await db.category.findMany({
        select: {
          id: true,
          name: true,
          lvl: true,
          cId: true,
          icon: true,
          parent: { select: { name: true } },
        },
      })
    ).map((c) => ({ ...c, parent: c.parent?.name || "" }));

    const searchResultTypes = helpers.getObjValues<number>(SearchResultType);

    return { topCategories, categories, searchResultTypes };
  },
  SearchGlobal: async (
    _: any,
    query: { search: string }
  ): Promise<SearchRes[]> => {
    const categories = (
      await db.category.findMany({
        where: { name: { mode: "insensitive", contains: query.search } },
        select: { name: true, id: true },
      })
    ).map((cat) => ({ ...cat, type: SearchResultType.Category }));

    const products = (
      await db.product.findMany({
        where: { name: { mode: "insensitive", contains: query.search } },
        select: { name: true, id: true },
      })
    ).map((cat) => ({ ...cat, type: SearchResultType.Product }));

    const brands = (
      await db.brand.findMany({
        where: { name: { mode: "insensitive", contains: query.search } },
        select: { name: true, id: true },
      })
    ).map((cat) => ({ ...cat, type: SearchResultType.Brand }));

    return [...categories, ...brands, ...products];
  },
};
