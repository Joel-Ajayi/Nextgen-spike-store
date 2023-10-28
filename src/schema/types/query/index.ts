import { list, nonNull, queryField, stringArg } from "nexus";
import { colours } from "../../../db/app.data";

export * from "./user";
export * from "./category";
export * from "./product";
export * from "./brand";

export const d = queryField("GetColors", {
  type: nonNull(list(list("String"))),
  resolve(_, args, ctx) {
    return colours;
  },
});
