import { IFile } from ".";

export type InitialCategoryController = {
  categories: CategoryMini[];
};

export enum CatFilterType {
  Txt = "Text",
  Num = "Number",
  Range = "Range",
}

export enum CategoryType {
  SuperOrd = "SuperOrd",
  Basic = "Basic",
  SubOrd = "SubOrd",
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
  type: CategoryType;
  parent: string;
};

export type Category = {
  id?: string;
  name: string;
  type?: CategoryType;
  parent: string;
  description: string;
  image: IFile[];
  banners: IFile[];
  filters: CatFilter[];
};
