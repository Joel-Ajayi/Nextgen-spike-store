import { number } from "yup";
import { Brand, IFile } from ".";

export type InitialCategoryController = {
  categories: CategoryMini[];
  category: Category;
  formData: CategoryFormData;
};

export type CategoryFormData = {
  brands: Brand[];
  offerTypes: string[];
  offerAudiences: string[];
  featureTypes: string[];
};

export type CategoryFeature = {
  id: string;
  name: string;
  type: number;
  options: string[];
  parentId: string | null;
  useAsFilter: boolean;
};

export type CategoryOffer = {
  id?: string;
  type: number; // -0-flash sales -1- free shipping
  discount: number;
  audience: number; // -0-any-1-new-2-old
  banner: IFile | string;
  validUntil: string;
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
  features: CategoryFeature[];
  offers: CategoryOffer[];
  hasWarrantyAndProduction: boolean;
};
