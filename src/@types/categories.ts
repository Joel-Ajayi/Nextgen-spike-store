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
  banners: string[];
};

export type Category_I = {
  name: string;
  parent: string | null;
  description: string;
  image?: Promise<FileUpload> | null;
  brand: string | null;
  hasWarrantyAndProduction: boolean;
  features: CategoryFeature[];
};

export type Category_I_U = {
  id: string;
  name: string;
  description?: string | null;
  image: Promise<FileUpload>;
  brand: string;
  hasWarrantyAndProduction: boolean;
  features: CategoryFeature[];
};

export type CategoryMini = {
  name: string;
  lvl: Number;
  cId: number;
  parent: string;
  image?: string | null;
  features: CategoryFeature[];
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
