import { inputObjectType } from "nexus";

export const loginInput = inputObjectType({
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
