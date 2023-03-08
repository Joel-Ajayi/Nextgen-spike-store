import { CatFilterType } from "@prisma/client";

export type CatFilter = {
  name: string;
  type: CatFilterType;
  unit: string;
  options: string[];
  isRequired: boolean;
};

export type CategoryForm = {
  name: string;
  parent: string;
  description: string;
  image: File[] | String[];
  banners: File[] | String[];
  filters: CatFilter[];
};
