import { LandingPageData } from "../../../@types";
import { CategoryBanner } from "../../../@types/categories";
import { db } from "../../../db/prisma/connect";

export default {
  LandingPageData: async (_: any): Promise<LandingPageData> => {
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
        where: { discount: { gt: 0 } },
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
      categories,
    };
  },
};
