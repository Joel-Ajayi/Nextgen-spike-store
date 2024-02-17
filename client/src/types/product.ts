import { Brand, IFile, Pagination } from ".";
import { CategoryFeature, CategoryMini } from "./category";

export type ProductFormData = {
  categories: CategoryMini[];
  categoriesPath: string[];
  brands: Brand[];
  paymentTypes: {
    type: string;
    val: number;
  }[];
  colours: string[][];
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
  mfgDate: number;
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
