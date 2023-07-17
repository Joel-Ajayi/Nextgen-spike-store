import { inputObjectType, list, nonNull } from "nexus";
import { CatFilterTypeEnum } from "./enums";

export const SignInInput = inputObjectType({
  name: "SignInInput",
  definition(t) {
    t.nullable.string("email"), t.nullable.string("pwd");
  },
});

export const SignUpInput = inputObjectType({
  name: "SignUpInput",
  definition(t) {
    t.nullable.string("email"), t.nonNull.string("pwd");
  },
});

export const VerificationTokenInput = inputObjectType({
  name: "VerificationTokenInput",
  definition(t) {
    t.nonNull.string("token");
  },
});

export const SetTokenInput = inputObjectType({
  name: "SetTokenInput",
  definition(t) {
    t.nonNull.string("email");
  },
});

export const CategoryInput = inputObjectType({
  name: "CategoryInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("parent");
    t.string("description");
    t.nullable.upload("image");
    t.nonNull.list.nonNull.upload("banners");
    t.nonNull.boolean("hasWarranty");
    t.field("filters", { type: nonNull(list(nonNull(CategoryFilterInput))) });
  },
});

export const CategoryFilterInput = inputObjectType({
  name: "CategoryFilterInput",
  definition(t) {
    t.nonNull.string("name"),
      t.nonNull.field("type", { type: CatFilterTypeEnum }),
      t.nullable.string("unit"),
      t.nonNull.list.nonNull.string("options"),
      t.nonNull.boolean("isRequired");
  },
});

export const CategoryUpdateInput = inputObjectType({
  name: "CategoryUpdateInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.string("description");
    t.nullable.upload("image");
    t.nonNull.boolean("hasWarranty");
    t.nonNull.list.nonNull.upload("banners");
    t.field("filters", { type: nonNull(list(CategoryFilterInput)) });
  },
});

export const CategoryFilterUpdateInput = inputObjectType({
  name: "CategoryFilterUpdateInput",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.field("type", { type: CatFilterTypeEnum });
    t.nullable.string("unit");
    t.nonNull.list.nonNull.string("options");
    t.nonNull.boolean("isRequired");
  },
});

export const CategoryFilterValueInput = inputObjectType({
  name: "CategoryFilterValueInput",
  definition(t) {
    t.nonNull.string("optionId");
    t.nonNull.list.nonNull.string("values");
  },
});

export const ProductWarrantyInput = inputObjectType({
  name: "ProductWarrantyInput",
  definition(t) {
    t.nonNull.int("duration");
    t.nonNull.string("covered");
  },
});

export const ProductInput = inputObjectType({
  name: "ProductInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.int("cId");
    t.nonNull.string("description");
    t.nonNull.int("price");
    t.nonNull.int("count");
    t.nonNull.string("brand");
    t.int("discount");
    t.nonNull.string("mfgCountry");
    t.nonNull.string("mfgDate");
    t.nonNull.list.nonNull.string("colors");
    t.nonNull.list.nonNull.string("payment");
    t.nonNull.list.nonNull.upload("images");
    t.field("warranty", { type: ProductWarrantyInput });
    t.field("filters", { type: list(nonNull(CategoryFilterValueInput)) });
  },
});

export const BrandInput = inputObjectType({
  name: "BrandInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.upload("image");
  },
});
