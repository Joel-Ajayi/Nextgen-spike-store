import { FileUpload } from "graphql-upload/Upload";
import {
  CategoryFeature,
  CategoryMicro,
  CategoryMini,
  CategoryFeaturesMini,
  CategoryOfferType,
} from "./categories";
import { Brand } from "./brand";
import { Pagination } from ".";

export type ProductInfo = {
  id: string;
  name: string;
  description: string;
  price: number;
  count: number;
  sku?: string;
  discount: number;
  colours: string[];
  numSold: number;
  paymentType: number;
  images: String[];
  warrCovered: string | null;
  warrDuration: number | null;
  mfgDate: string | null;
};

export interface Product extends ProductInfo {
  cId: number;
  brand: string;
  features: ProductFeature[];
}

export type ProductUpdateReturn = {
  id: string;
  sku: string;
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
  numSold: number;
  numReviews: number;
  images: string[];
  features: ProductFeature[];
};

export type ProductMini2 = {
  id: string;
  name: string;
  count: number;
  category: string;
  price: number;
  rating: number;
};

export type FilterPageProduct = {
  id: string;
  name: string;
  price: number;
  brand: string;
  discount: number;
  rating: number;
  numRating: number;
  numReviews: number;
  colours: string[];
  images: string[];
};

export type Product_I = {
  name: string;
  cId: number;
  description: string;
  price: number;
  count: number;
  brand: string;
  discount: number;
  colours: string[];
  paymentType: number;
  images: Promise<FileUpload>[];
  mfgDate: string;
  warrCovered: string;
  warrDuration: number;
  features: ProductFeature_I[];
};

export type ProductCategory_I_U = {
  id: string;
};

export type Product_I_U = {
  id: string;
  name?: string;
  cId?: number;
  brand?: string;
  description?: string;
  price?: number;
  count?: number;
  discount?: number;
  mfgDate?: string;
  colours?: string[];
  paymentType?: number;
  images?: Promise<FileUpload>[];
  features?: ProductFeature[];
  warrCovered?: string;
  warrDuration?: number;
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
  isFirstCall: boolean;
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
  filters: ProductFeature_I[];
};

export type ProductFilterRes = {
  offers: string[];
  brands: string[];
  filters: CategoryFeaturesMini[];
  products: Pagination<ProductMini>;
  colours: string[];
};

export interface ProductFeature_I {
  id?: string;
  featureId: string;
  value: string;
}

export interface ProductFeature extends ProductFeature_I {
  id: string;
}

export enum PaymentType {
  ALL,
  CARD,
  COD,
}
