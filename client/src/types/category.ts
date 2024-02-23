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
  bannerColours: string[];
  tagline: string;
  audience: number; // -0-any-1-new-2-old
  image: IFile | string | null;
  validUntil: string;
};

export type CategoryBanner = {
  tagline: string;
  bannerColours: string[];
  image: string | IFile | null;
};

export type CategoryMini = {
  name: string;
  cId: number;
  lvl: number;
  parent: string;
  icon: string | IFile | null;
  hasWarrantyAndProduction: boolean;
  banner: CategoryBanner | null;
  features: CategoryFeature[];
};

export type Category = {
  id?: string;
  name: string;
  lvl?: number;
  brand?: string;
  parent: string;
  description: string;
  icon: string | IFile | null;
  features: CategoryFeature[];
  offers: CategoryOffer[];
  banner?: CategoryBanner | null;
  hasWarrantyAndProduction: boolean;
};
