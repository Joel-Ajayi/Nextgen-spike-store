import { boolean } from "yup";
import { Brand, IFile } from ".";
import { CategoryFeature, CategoryMini } from "./category";

// export enum PaymentType {
//   ALL = 0,
//   CARD = 1,
//   COD = 2,
// }

export type ProductFormData = {
  categories: CategoryMini[];
  categoriesPath: string[];
  brands: Brand[];
  paymentTypes: {
    type: string;
    val: number;
  }[];
  colours: string[][];
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

export interface ProductInput extends Product {
  isValid: boolean[];
  initFeatures: ProductFeature[];
}

export type InitialProductController = {
  formData: ProductFormData;
  product: ProductInput;
};

export type ProductFeature = {
  id?: string;
  featureId: string;
  value: string | number;
};
