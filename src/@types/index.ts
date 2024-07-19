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
  list: T[][];
};

export enum SearchResType {
  Brand,
  Category,
  Product,
}

export type SearchRes = {
  id: string;
  name: string;
  type: SearchResType;
};

export type LandingPageData = {
  banners: CategoryBanner[];
  offers: CategoryOffer[];
  topCategories: CategoryMini[];
  hotDeals: ProductMini[];
  newProducts: ProductMini[];
  popularProducts: ProductMini[];
};
