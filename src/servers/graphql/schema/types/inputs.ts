import { inputObjectType } from "nexus";

export const loginInput = inputObjectType({
  name: "LoginInput",
  definition(t) {
    t.nonNull.string("email"), t.nonNull.string("password");
  },
});

export const signupInput = inputObjectType({
  name: "SignupInput",
  definition(t) {
    t.nonNull.string("email"),
    t.nonNull.string("password"),
    t.nonNull.string("fname"),
    t.nonNull.string("lname");
  },
});
