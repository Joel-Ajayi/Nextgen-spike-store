import { FileUpload } from "graphql-upload/Upload";

// I-input
//u-update

export type Category = {
  id: string;
  name: string;
  lvl: Number;
  parent?: string | null;
  description: string;
  hasWarrantyAndProduction: boolean;
  brand: string;
  image: string[];
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export type Category_I = {
  name: string;
  parent: string | null;
  description: string;
  image?: Promise<FileUpload> | null;
  brand: string | null;
  hasWarrantyAndProduction: boolean;
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export type Category_I_U = {
  id: string;
  name: string;
  description?: string | null;
  image: Promise<FileUpload>;
  brand: string;
  hasWarrantyAndProduction: boolean;
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export type CategoryMini = {
  name: string;
  lvl: Number;
  cId: number;
  parent: string;
  image?: string | null;
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export interface CategoryFeature {
  id: string;
  name: string;
  type: number;
  options: string[];
  parentId: string | null;
  categoryId?: string | null;
  useAsFilter: boolean;
}

export interface CategoryOffer {
  id: string;
  type: number; // -0-flash sales -1- free shipping
  discount: number;
  banner: string | Promise<FileUpload>;
  validUntil: string;
}

export type CategoryForm = {
  name: string;
  parent: string;
  description: string;
  image: File[] | String[];
  banners: File[] | String[];
  features: CategoryFeature[];
};

export enum CategoryFeatureType {
  Text,
  Number,
}

export enum CategoryOfferType {
  FlashSales,
  FreeShipping,
}

export enum CategoryOfferTargetAudience {
  AnyBody,
  FirstTimeCustomers,
  LongTimeUsers,
}
