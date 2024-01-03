import Upload, { FileUpload } from "graphql-upload/Upload";
import { CategoryMini } from "./categories";
import { Brand } from "./brand";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  count: number;
  brand: string;
  discount: number;
  colors: string[];
  payment: PaymentType[];
  images: String[];
  warrCovered: string;
  warrDuration: number;
  mfgCountry: string;
  mfgDate: string;
  filters: CategoryFilterValue[];
};

export type ProductMini = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  discount: number;
  rating: number;
  images: string[];
};

export type FilterPageProduct = {
  id: string;
  name: string;
  price: number;
  brand: string;
  discount: number;
  rating: number;
  numRating: number;
  numReviews: number;
  colors: string[];
  images: string[];
};

export type Product_I = {
  name: string;
  cId: number;
  description: string;
  price: number;
  count: number;
  brand: string;
  discount: number;
  mfgCountry: string;
  mfgDate: string;
  colors: string[];
  payment: PaymentType[];
  images: Promise<FileUpload>[];
  warranty: ProductWarranty_I;
  filters: CategoryFilterValue_I[];
};

export type ProductCategory_I_U = {
  pId: string;
  cId: string;
  filters: CategoryFilterValue_I[];
};

export type ProductBoilerPlate = {
  brands: Brand[];
  categories: CategoryMini[];
  colours: string[][];
  paymentTypes: PaymentType[];
};

export type ProductInfo_I_U = {
  id: string;
  name: string;
  description: string;
  price: number;
  count: number;
  brand: string;
  discount: number;
  mfgCountry: string;
  mfgDate: string;
  colors: string[];
  payment: PaymentType[];
  images: Promise<FileUpload>[];
  warranty: ProductWarranty_I;
};

export type CategoryFilterValue = {
  id: string;
  name: string;
  optionId: string;
  unit: string | null;
  type: string;
  values: string[];
};

export interface CategoryFilterValue_I {
  id?: string | null;
  optionId: string;
  values: string[];
}

export interface CategoryFilterValue_I_U extends CategoryFilterValue_I {
  id: string;
}

export type ProductWarranty_I = {
  duration: number;
  covered: string;
};

export enum PaymentType {
  ALL = 0,
  CARD = 1,
  COD = 2,
}

// export const CreateProductData = objectType({
//   name: "CreateProductData",
//   definition(t) {
//     t.nonNull.list.field("brands", { type: Brand });
//     t.nonNull.list.field("categories", { type: CategoryMini });
//     t.list.nonNull.list.nonNull.string("colours");
//     t.nonNull.list.string("paymentMethods");
//   },
// });
