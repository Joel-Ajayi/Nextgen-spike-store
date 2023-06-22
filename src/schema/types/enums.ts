import { CatFilterType } from "@prisma/client";
import { enumType } from "nexus";

export const CatFilterTypeEnum = enumType({
  name: "CatFilterType",
  members: Object.keys(CatFilterType),
});
