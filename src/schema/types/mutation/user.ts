import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { mutationField } from "nexus";
import {
  validateLogin,
  validateSignUp,
} from "../../../helpers/validators/input";
import { User } from "@prisma/client";
import { CONST } from "../../../@types/conts";
import { MessageObj } from "../objects";
import { SignupInput } from "../inputs";
import {
  alreadySignedUp,
  checkLoginCredentials,
} from "../../../middlewares/middlewares";

const { SESSION_NAME } = process.env;

export const LignUp = mutationField("Signup", {
  type: MessageObj,
  args: { data: SignupInput },
  resolve: async (_, { data }, ctx) => {
    // validates arguments
    await validateSignUp(data);
    // check if user already exist
    await alreadySignedUp(data?.email as string, ctx.db);

    const password = await bcrypt.hash(data?.password as string, 12);
    const user = await ctx.db.user.create({
      data: {
        ...(data as User),
        password,
        username: `${data?.fName}${Buffer.from(randomUUID(), "hex").toString(
          "base64"
        )}`,
      },
    });
    ctx.req.session.user = user.id;
    return { message: CONST.messages.user.signup };
  },
});

export const Login = mutationField("Login", {
  type: MessageObj,
  args: { data: "LoginInput" },
  resolve: async (_, { data }, ctx) => {
    // validates arguments
    await validateLogin(data);
    // check user credentials
    const user = await checkLoginCredentials(
      data?.email as string,
      data?.password as string
    );
    // set session cookie
    ctx.req.session.user = user.id;
    return { message: CONST.messages.user.logged_in };
  },
});

export const Logout = mutationField("Logout", {
  type: MessageObj,
  resolve: async (_, args, ctx) => {
    if (ctx.user) {
      ctx.res.clearCookie(SESSION_NAME as string);
      ctx.req.session.destroy((err: any) => {
        if (err) throw new Error(CONST.errors.server);
      });
    }
    return { message: CONST.messages.user.logged_out };
  },
});
