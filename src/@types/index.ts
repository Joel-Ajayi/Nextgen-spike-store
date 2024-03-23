import {
  CategoryBanner,
  CategoryMicro,
  CategoryMini,
  CategoryOffer,
  CategoryOfferType,
} from "./categories";
import { ProductFeature_I, ProductMini } from "./products";

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

export enum ProductFilterSort {
  Popular = "Popular",
  Newest = "Newest",
  Price = "lowest to highest",
  Price2 = "highest to lowest",
}

export type ProductFilterRange = {
  from: number;
  to: number;
};

export type ProductFilter = {
  skip: number;
  take: number;
  category: string | null;
  brands: string[];
  colours: string[];
  sortBy: ProductFilterSort | null;
  price: ProductFilterRange | null;
  offers: CategoryOfferType[];
  discount: ProductFilterRange;
  rating: ProductFilterRange;
  filters: ProductFeature_I[];
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
