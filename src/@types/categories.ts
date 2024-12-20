import { FileUpload } from "graphql-upload/Upload";

// I-input
//u-update

export type Category = {
  id: string;
  name: string;
  lvl: Number;
  icon: string;
  parent?: string | null;
  description: string;
  hasWarrantyAndProduction: boolean;
  brand: string;
  banner: CategoryBanner;
  numSold: number;
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export type Category_I = {
  name: string;
  icon?: Promise<FileUpload>;
  parent: string | null;
  description: string;
  brand: string | null;
  hasWarrantyAndProduction: boolean;
  banner: CategoryBanner;
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export type Category_I_U = {
  id: string;
  icon: Promise<FileUpload> | string | null;
  name: string;
  description?: string;
  brand: string;
  hasWarrantyAndProduction: boolean;
  features: CategoryFeature[];
  banner: CategoryBanner;
  offers: CategoryOffer[];
};

export type CategoryMini = {
  id: string;
  name: string;
  lvl: Number;
  cId: number;
  icon: string;
  parent: string;
  numSold: number;
  banner: CategoryBanner | null;
  features: CategoryFeature[];
  offers: CategoryOffer[];
};

export type CategoryMicro = {
  id: string;
  name: string;
  lvl: Number;
  cId: number;
  icon: string | null;
  parent: string;
};

export type CategoryBanner = {
  id: string;
  tagline: string;
  bannerColours: string[];
  image: string | Promise<FileUpload>;
};

export type CategoryFeature = {
  id: string;
  name: string;
  type: number;
  options: string[];
  useAsFilter: boolean;
};

export type CategoryFeaturesMini = {
  id: string;
  options: string[];
  name: string;
};

export type CategoryOffer = {
  id: string;
  type: number; // -0-flash sales -1- free shipping
  tagline: string;
  bannerColours: string[];
  discount: number;
  audience: number;
  image: string | Promise<FileUpload>;
  validUntil: string;
};

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
