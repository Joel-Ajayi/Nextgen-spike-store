import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { mutationField } from "nexus";
import {
  validateLogin,
  validateSellerSignUp,
} from "../../../../helpers/validators/input";
import { Seller } from "@prisma/client";
import { CONST } from "../../../../@types/conts";
import { MessageObj } from "../objects";
import { SignupInput } from "../inputs";
import {
  alreadySignedUpSeller,
  checkSellerLoginCredentials,
} from "../../../../middlewares/middlewares";

const { SESSION_NAME } = process.env;

export const SellerSignUp = mutationField("SellerSignUp", {
  type: MessageObj,
  args: { data: SignupInput },
  resolve: async (_, { data }, ctx) => {
    // validates arguments
    await validateSellerSignUp(data);
    // check if user already exist
    await alreadySignedUpSeller(data?.email as string);

    // new seller
    const sellerCount = await ctx.db.seller.count();
    const password = await bcrypt.hash(data?.password as string, 12);
    const seller = await ctx.db.seller.create({
      data: {
        ...(data as Seller),
        password,
        role: sellerCount === 0 ? 2 : 0,
        username: `${data?.fName}${Buffer.from(randomUUID(), "hex").toString(
          "base64"
        )}`,
      },
    });
    ctx.req.session.user = seller.id;
    return { message: CONST.messages.user.signup };
  },
});

export const SellerLogin = mutationField("SellerLogin", {
  type: MessageObj,
  args: { data: "LoginInput" },
  resolve: async (_, { data }, ctx) => {
    // validates arguments
    await validateLogin(data);
    // check user credentials
    const user = await checkSellerLoginCredentials(
      data?.email as string,
      data?.password as string
    );
    // set session cookie
    ctx.req.session.user = user.id;
    return { message: CONST.messages.user.logged_in };
  },
});

export const SellerLogout = mutationField("SellerLogout", {
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
