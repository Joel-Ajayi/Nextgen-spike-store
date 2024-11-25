import { FileUpload } from "graphql-upload/Upload";

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
  rating: number;
  numReviews: number;
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

export type Review_I = {
  prd_id: string;
  comment: string;
  title: string;
  rating: number;
};

export interface ProductFeature_I {
  id?: string;
  featureId: string;
  value: string;
}

export interface ProductFeature extends ProductFeature_I {
  id: string;
  feature?: string;
}

export enum PaymentType {
  Card,
  Cash_On_Delivery,
}

export enum PaymentStatus {
  PENDING,
  REFUNDED,
  PAID,
}

export enum OrderStatus {
  ORDERED,
  PACKED,
  SHIPPED,
  RETURNED,
  DELIVERED,
}

export enum CatalogQuery {
  SortBy = "sort_by",
  Search = "search",
  Category = "category",
  Brand = "brand",
  Discount = "discount",
  Price = "price",
  Rating = "rating",
  Offers = "offer",
}

export enum CatalogSortQueries {
  Newest = "newest",
  Popular = "popular",
  Hotdeals = "hotdeals",
  PriceDesc = "price_desc",
  Price_asc = "price_asc",
  Rating = "rating",
}

export type CatalogFilter = {
  id: string;
  type: number;
  options: string[];
};

export type QueryCatalog = {
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
  filters: CatalogFilter[];
};

export type Order_I = {
  shippingAddress: string;
  paymentMethod: number;
  itemIds: string[];
  itemQtys: number[];
};

export type InitPayment = {
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};
