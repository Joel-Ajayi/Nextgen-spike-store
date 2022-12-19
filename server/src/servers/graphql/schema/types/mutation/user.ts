import bcrypt from "bcryptjs";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { randomUUID } from "crypto";
import { extendType, mutationField } from "nexus";
import { signupArgs, loginArgs } from "../../../../../helpers/validators/input";
import { User } from "@prisma/client";
import { CONST } from "../../../../../@types/conts";
import {
  alreadySignedUp,
  checkLoginCredentials,
} from "../../../../../helpers/users";
import { MessageObj } from "../objects";
import { SignupInput } from "../inputs";

const { SESSION_NAME } = process.env;

export const userSignUp = mutationField("signup", {
  type: MessageObj,
  args: { data: SignupInput },
  resolve: async (_, { data }, ctx) => {
    try {
      // validates arguments
      await signupArgs.validate(data);
    } catch (error) {
      throw new UserInputError((error as any).message);
    }

    // check if user is already loggedIn
    if (ctx.user) throw new Error(CONST.errors.alreadyLoggedIn);

    // check if user already exist
    await alreadySignedUp(data?.email as string, ctx.db);

    const password = await bcrypt.hash(data?.password as string, 12);

    const userCount = await ctx.db.user.count();
    const role = userCount === 0 ? 3 : 0;

    const user = await ctx.db.user.create({
      data: {
        ...(data as User),
        password,
        role,
        username: `${data?.fName}${Buffer.from(randomUUID(), "hex").toString(
          "base64"
        )}`,
      },
    });
    ctx.req.session.user = user.id;
    return { message: CONST.messages.user.signup };
  },
});

export const login = mutationField("login", {
  type: MessageObj,
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

export const logout = mutationField("logout", {
  type: MessageObj,
  resolve: async (_, args, ctx) => {
    // check if logged_in
    if (!ctx.user)
      throw new AuthenticationError(CONST.errors.login, {
        statusCode: 401,
      });

    ctx.res.clearCookie(SESSION_NAME as string);
    ctx.req.session.destroy((err) => {
      if (err) throw new Error(CONST.errors.server);
    });
    return { message: CONST.messages.user.logged_out };
  },
});
