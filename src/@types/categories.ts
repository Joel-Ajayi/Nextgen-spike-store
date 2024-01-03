import Upload, { FileUpload } from "graphql-upload/Upload";

// I-input
//u-update

export type Category = {
  id: string;
  name: string;
  lvl: Number;
  parent?: string | null;
  description: string;
  hasWarranty: boolean;
  hasMfg: boolean;
  brand: string;
  image: string[];
  filters: CategoryFilter[];
  banners: string[];
};

export type Category_I = {
  name: string;
  parent: string | null;
  description: string;
  image?: Promise<FileUpload> | null;
  brand: string | null;
  hasWarranty: boolean;
  hasMfg: boolean;
  filters: CategoryFilter[];
};

export type Category_I_U = {
  id: string;
  name: string;
  description?: string | null;
  image: Promise<FileUpload>;
  brand: string;
  hasWarranty: boolean;
  hasMfg: boolean;
  filters: CategoryFilter[];
};

export type CategoryMini = {
  name: string;
  lvl: Number;
  parent: string;
  image?: string | null;
};

export interface CategoryFilter {
  id: string;
  name: string;
  type: CategoryFilterType | string;
  unit: string | null;
  options: string[];
  isRequired: boolean;
}

export type CategoryForm = {
  name: string;
  parent: string;
  description: string;
  image: File[] | String[];
  banners: File[] | String[];
  filters: CategoryFilter[];
};

export enum CategoryFilterType {
  Text = "T", //Text
  Number = "N", //Number
}
