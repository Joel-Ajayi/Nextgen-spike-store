import {
  CategoryBanner,
  CategoryMicro,
  CategoryMini,
  CategoryOffer,
} from "./categories";
import { ProductMini } from "./products";

export type Message = {
  message: string;
};

export type Pagination<T> = {
  skip: number;
  page: number;
  numPages: number;
  count: number;
  take: number;
  list: T[];
};

export type LandingPageData = {
  banners: CategoryBanner[];
  offers: CategoryOffer[];
  topCategories: CategoryMini[];
  categories: CategoryMicro[];
  hotDeals: ProductMini[];
  newProducts: ProductMini[];
  popularProducts: ProductMini[];
};
