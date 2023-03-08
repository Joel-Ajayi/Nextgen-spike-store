import { CatFilterType, CategoryType } from "@prisma/client";
import { enumType } from "nexus";

export const CatFilterTypeEnum = enumType({
  name: "CatFilterType",
  members: Object.keys(CatFilterType),
});

export const CatTypeEnum = enumType({
  name: "CatTypeEnum",
  members: Object.keys(CategoryType),
});
