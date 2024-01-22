import { IFile } from ".";

export type InitialCategoryController = {
  categories: CategoryMini[];
  category: Category;
};

export enum CategoryFeatureType {
  Text,
  Number,
}

export type CategoryFeature = {
  id: string;
  name: string;
  type: CategoryFeatureType;
  options: string[];
  parentId: string | null;
  useAsFilter: boolean;
};

export type CategoryMini = {
  name: string;
  cId: number;
  lvl: number;
  parent: string;
  hasWarrantyAndProduction: boolean;
  image?: string;
  features: CategoryFeature[];
};

export type Category = {
  id?: string;
  name: string;
  lvl?: number;
  brand?: string;
  parent: string;
  description: string;
  image: (IFile | string)[];
  banners: (IFile | string)[];
  features: CategoryFeature[];
  hasWarrantyAndProduction: boolean;
};
