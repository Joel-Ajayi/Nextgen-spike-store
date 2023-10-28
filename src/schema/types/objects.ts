import { interfaceType, list, nonNull, objectType } from "nexus";
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
    t.nullable.field("fName", { type: "String" });
    t.nullable.field("lName", { type: "String" });
    t.nullable.field("contactNumber", { type: "String" });
  },
});

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.int("lvl");
    t.string("parent");
    t.nonNull.string("description");
    t.nonNull.boolean("hasWarranty");
    t.nonNull.boolean("hasMfg");
    t.nonNull.string("brand");
    t.nonNull.list.nonNull.string("image");
    t.nonNull.list.nonNull.string("banners");
    t.field("filters", {
      type: nonNull(list(nonNull(CategoryFilter))),
    });
  },
});

export const CategoryMini = objectType({
  name: "CategoryMini",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.int("lvl");
    t.nonNull.string("parent");
    t.nullable.string("image");
  },
});

export const CategoryFilter = objectType({
  name: "CategoryFilter",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.string("type");
    t.nullable.string("unit");
    t.nonNull.list.nonNull.string("options");
    t.nonNull.boolean("isRequired");
  },
});

export const CategoryFilterValue = objectType({
  name: "CategoryFilterValue",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.string("optionId");
    t.nullable.string("unit");
    t.nullable.string("type");
    t.nonNull.list.nonNull.string("values");
  },
});

export const ProductMini = objectType({
  name: "ProductMini",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.int("price");
    t.nullable.string("category");
    t.nullable.string("brand");
    t.nonNull.int("rating");
    t.nonNull.int("discount");
    t.nonNull.list.nonNull.string("images");
  },
});

export const Product = objectType({
  name: "Product",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nullable.string("category");
    t.nonNull.string("description");
    t.nonNull.int("price");
    t.nonNull.int("discount");
    t.nonNull.string("brand");
    t.nonNull.list.nonNull.string("colors");
    t.nonNull.list.nonNull.int("payment");
    t.nonNull.list.nonNull.string("images");
    t.string("warrCovered");
    t.int("warrDuration");
    t.string("mfgCountry");
    t.string("mfgDate");
    t.field("filters", { type: nonNull(list(nonNull(CategoryFilterValue))) });
  },
});

export const CreateProductData = objectType({
  name: "CreateProductData",
  definition(t) {
    t.nonNull.list.field("brands", { type: Brand });
    t.nonNull.list.field("categories", { type: CategoryMini });
    t.list.nonNull.list.nonNull.string("colours");
    t.nonNull.list.string("paymentMethods");
  },
});

export const FilterPageProduct = objectType({
  name: "ProductFilterPage",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nullable.string("category");
    t.nonNull.string("description");
    t.nonNull.int("price");
    t.nonNull.string("brand");
    t.nonNull.int("rating");
    t.nonNull.int("numRating");
    t.nonNull.int("numReviews");
    t.nonNull.int("discount");
    t.nonNull.list.nonNull.string("colors");
    t.field("filters", {
      type: nonNull(list(nonNull(CategoryFilterValue))),
    });
    t.nonNull.list.nonNull.string("images");
  },
});

export const Brand = objectType({
  name: "Brand",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.list.nonNull.string("image");
  },
});
