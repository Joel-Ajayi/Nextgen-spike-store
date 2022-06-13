import { User } from "@prisma/client";
import { extendType } from "nexus";
import { CONST } from "../../../../@types/conts";
import {
  alreadySignedUp,
  checkLoginCredentials,
} from "../../../../helpers/users";
import { loginArgs, signupArgs } from "../../../../helpers/validators/input";
import bcrypt from "bcryptjs";
import { AuthenticationError } from "apollo-server-express";
import { signupInput } from "./inputs";

export const UserSignUp = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signup", {
      type: "Message",
      args: { data: "SignupInput" },
      resolve: async (_, { data }, ctx) => {
        // validates arguments
        await signupArgs.validate(data);

        // check if user is already loggedIn
        if (ctx.user) throw new Error(CONST.errors.alreadyLoggedIn);

        // check if user already exist
        await alreadySignedUp(data?.email as string, ctx.db);

        const password = await bcrypt.hash(data?.password as string, 12);

        const userCount = await ctx.db.user.count();
        const role = userCount === 0 ? "SUPER_ADMIN" : data?.role;

        const user = await ctx.db.user.create({
          data: { ...(data as User), password, role },
        });
        ctx.req.session.user = user.id;
        return { message: CONST.messages.user.signup };
      },
    });
  },
});

export const Login = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("login", {
      type: "Message",
      args: { data: "LoginInput" },
      resolve: async (_, { data }, ctx) => {
        // check if user is already loggedIn
        if (ctx.user) throw new Error(CONST.errors.alreadyLoggedIn);

        // validates arguments
        await loginArgs.validate(data);

        // check user credentials
        const user = await checkLoginCredentials(
          data?.email as string,
          data?.password as string,
          ctx.db
        );

        // set session cookie
        ctx.req.session.user = user.id;
        return { message: CONST.messages.user.logged_in };
      },
    });
  },
});

export const Logout = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("logout", {
      type: "Message",
      resolve: async (_, args, ctx) => {
        // check if logged_in
        if (!ctx.user)
          throw new AuthenticationError(CONST.errors.login, {
            statusCode: 400,
          });

        return { message: CONST.messages.user.logged_out };
      },
    });
  },
});
