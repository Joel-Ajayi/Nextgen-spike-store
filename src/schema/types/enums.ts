import { enumType } from "nexus";
import { CatFilterType } from "../../@types/Category";

export const CatFilterTypeEnum = enumType({
  name: "CatFilterType",
  members: Object.keys(CatFilterType),
});
