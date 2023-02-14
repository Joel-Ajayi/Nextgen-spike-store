import { inputObjectType, list, nonNull } from "nexus";

export const LoginInput = inputObjectType({
  name: "LoginInput",
  definition(t) {
    t.nonNull.string("email"), t.nonNull.string("password");
  },
});

export const SignupInput = inputObjectType({
  name: "SignupInput",
  definition(t) {
    t.nonNull.string("email"),
      t.nonNull.string("password"),
      t.nonNull.string("fName"),
      t.nonNull.string("lName");
  },
});

export const NewCategoryInput = inputObjectType({
  name: "NewCategoryInput",
  definition(t) {
    t.nonNull.string("name"),
      t.string("parentId"),
      t.field("filters", {
        type: nonNull(list("CategoryFilterInput")),
      }),
      t.string("description"),
      t.nonNull.list.upload("banners"),
      t.upload("image");
  },
});

export const CategoryFilterInput = inputObjectType({
  name: "CategoryFilterInput",
  definition(t) {
    t.nonNull.string("name"),
      t.nonNull.string("type"),
      t.nonNull.boolean("isRequired");
  },
});
