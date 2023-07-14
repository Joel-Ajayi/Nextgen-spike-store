import { list, nonNull, objectType } from "nexus";
import { CatFilterTypeEnum } from "./enums";

export const MessageObj = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.field("message", { type: "String" });
  },
});

export const UserObj = objectType({
  name: "User",
  definition(t) {
    t.nonNull.field("id", { type: "ID" });
    t.nonNull.field("email", { type: "String" });
    t.nonNull.field("role", { type: "Int" });
    t.nonNull.field("avatar", { type: "String" });
    t.nullable.field("fullName", { type: "String" });
    t.nullable.field("contactNumber", { type: "String" });
  },
});

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.string("id"), t.nonNull.string("name"), t.nonNull.int("lvl");
    t.string("parent"),
      t.nonNull.string("description"),
      t.nonNull.string("image"),
      t.nonNull.list.nonNull.string("banners"),
      t.field("filters", {
        type: nonNull(list(nonNull(CategoryFilter))),
      });
  },
});

export const CategoryMini = objectType({
  name: "CategoryMini",
  definition(t) {
    t.nonNull.string("name"), t.nonNull.int("lvl"), t.nonNull.string("parent");
  },
});

export const CategoryFilter = objectType({
  name: "CategoryFilter",
  definition(t) {
    t.nonNull.string("id"),
      t.nonNull.string("name"),
      t.nonNull.field("type", {
        type: CatFilterTypeEnum,
      }),
      t.nullable.string("unit"),
      t.nonNull.list.nonNull.string("options"),
      t.nonNull.boolean("isRequired");
  },
});
