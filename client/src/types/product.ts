import { APIPagination, Brand, IFile, Pagination } from ".";
import { CategoryFeature, CategoryMini, CategoryOffer } from "./category";

export enum ProductsPageParams {
  SortBy = "",
}

export type ProductFormData = {
  categories: CategoryMini[];
  categoriesPath: string[];
  brands: Brand[];
  paymentTypes: {
    type: string;
    val: number;
  }[];
  featureTypes: string[];
  features: CategoryFeature[];
};

export type ProductUpdateReturn = {
  id: string;
  sku: string;
  features: ProductFeature[];
};

export type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  count: number;
  colours: string[];
  paymentType: number;
  images: (IFile | string)[];
  sku?: string;
  mfgDate: "";
  warrCovered: string;
  warrDuration: number;
  cId: number;
  brand: string;
  features: ProductFeature[];
};

export type ProductMini = {
  id: string;
  name: string;
  price: number;
  cId: number;
  brand: string;
  discount: number;
  rating: number;
  numReviews: number;
  numSold: number;
  images: string[];
  features: ProductFeature[];
};

export type ProductMini2 = {
  id: string;
  name: string;
  count: string;
  category: string;
  price: number;
  rating: number;
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
  offers: string[];
  discount: ProductFilterRange;
  rating: ProductFilterRange;
  filters: {
    featureId: string;
    value: string | number;
  }[];
};

export type productFilterReturn = {
  offers: string[];
  products: Pagination<ProductMini>;
  filters: {
    id: string;
    name: string;
    options: string[];
  }[];
  brands: string[];
};

export interface ProductInput extends Product {
  isValid: boolean[];
  initFeatures: ProductFeature[];
}

export type InitialProductController = {
  formData: ProductFormData;
  product: ProductInput;
  list: Pagination<ProductMini2>;
};

export type ProductFeature = {
  id?: string;
  featureId: string;
  value: string | number;
};

export type CatalogFilter = {
  id: string;
  name: string;
  options: string[];
};

export type CatalogStateAPI = {
  isCategoryChanged: boolean;
  price: string;
  offers: CategoryOffer[];
  products: APIPagination<ProductMini>;
  brands: string[];
  filters: CatalogFilter[];
};

export type CatalogStateType = {
  price: string;
  offers: CategoryOffer[];
  products: Pagination<ProductMini | null>;
  brands: string[];
  filters: CatalogFilter[];
};

export type QueryCatalogParams = {
  skip: number;
  take: number;
  count: number;
  sortBy: string;
  brands: string[];
  category: string;
  colours: string[];
  discount: number;
  search: string;
  offer: string;
  rating: number;
  priceMax: number;
  priceMin: number;
  filters: { id: string; options: string[] }[];
};
