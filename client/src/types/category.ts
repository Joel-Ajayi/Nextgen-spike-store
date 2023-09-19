import { IFile } from ".";

export type InitialCategoryController = {
  categories: CategoryMini[];
};

export type ProductWarranty = {
  duration: number;
  covered: string;
};

export type CategoryFilterValues = {
  values: string[];
  optionId: string;
};

export type NewProduct = {
  category: {
    name: string;
    path?: string;
  };
  brand: string;
  info: {
    name: string;
    description: string;
    images: (IFile | string)[];
    colors: string[];
    price: number;
    discount: number;
    paymentMethods: number[];
    warranty: ProductWarranty;
    mfgCountry: string;
    mfgDate: string;
  };
};

export type InitialProductController = {
  newProduct: NewProduct;
};

export enum CatFilterType {
  Txt = "Text",
  Num = "Number",
  Range = "Range",
}

export type CatFilter = {
  id?: string;
  name: string;
  type: CatFilterType;
  unit: string;
  options: string[];
  isRequired: boolean;
};

export type CategoryMini = {
  name: string;
  lvl: number;
  parent: string;
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
  filters: CatFilter[];
  hasWarranty: boolean;
};
