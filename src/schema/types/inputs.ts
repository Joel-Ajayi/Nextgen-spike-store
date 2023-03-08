import { extendType, inputObjectType, list, nonNull, nullable } from "nexus";
import { CatFilterTypeEnum, CatTypeEnum } from "./enums";

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
    t.nonNull.string("name"),
      t.nonNull.field("type", {
        type: CatTypeEnum,
      });
    t.string("parent"),
      t.nonNull.string("description"),
      t.nonNull.upload("image"),
      t.nonNull.list.nonNull.upload("banners"),
      t.field("filters", {
        type: nonNull(list(nonNull(CategoryFilterInput))),
      });
  },
});

export const CategoryFilterInput = inputObjectType({
  name: "CategoryFilterInput",
  definition(t) {
    t.nonNull.string("name"),
      t.nonNull.field("type", {
        type: CatFilterTypeEnum,
      }),
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
    t.string("parent");
    t.nonNull.string("description");
    t.nonNull.upload("image");
    t.nonNull.list.nonNull.upload("banners");
    t.field("filters", {
      type: nonNull(list(nonNull(CategoryFilterUpdateInput))),
    });
  },
});

export const CategoryFilterUpdateInput = inputObjectType({
  name: "CategoryFilterUpdateInput",
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
