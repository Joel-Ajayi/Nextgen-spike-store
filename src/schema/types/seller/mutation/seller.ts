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
import {
  ForgotPasswordInput,
  SignupInput,
  VerificationTokenInput,
} from "../inputs";
import {
  alreadySignedIn,
  alreadySignedInSeller,
  alreadySignedUpSeller,
  checkSellerLoginCredentials,
} from "../../../../middlewares/middlewares";
import { SellerRoles } from "../../../../@types/User";
import jwt from "jsonwebtoken";
import {
  forgotPasswordEmail,
  sellerVerificationEmail,
} from "../../../../emails/verification";
import { GraphQLError } from "graphql";

const {
  SELLER_SESSION_NAME,
  EMAIL_VERIFICATION_SECRET,
  PASSWORD_VERIFICATION_SECRET,
} = process.env;

export const SellerSignUp = mutationField("SellerSignUp", {
  type: MessageObj,
  args: { data: SignupInput },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedInSeller(ctx);
    // validates arguments
    await validateSellerSignUp(data);
    // check if user already exist
    await alreadySignedUpSeller(data?.email as string);

    // new seller
    const sellerCount = await ctx.db.seller.count();
    const pwd = await bcrypt.hash(data?.pwd as string, 12);
    const seller = await ctx.db.seller.create({
      data: {
        ...(data as Seller),
        pwd,
        role: sellerCount === 0 ? SellerRoles.SUPER_ADMIN : SellerRoles.Seller,
      },
    });

    //save token to db
    const vToken = `${seller.id}${Math.floor(1000 + Math.random() * 9000)}`;
    ctx.db.user.update({ where: { id: seller.id }, data: { vToken } });

    // send token to email
    const token = await jwt.sign(vToken, EMAIL_VERIFICATION_SECRET as string, {
      expiresIn: "24h",
    });
    await sellerVerificationEmail(
      seller.email,
      `${ctx.req.headers.host}/verify_account?token=${token}`
    );
    return { message: CONST.messages.emailVerification };
  },
});

export const ForgotPassword = mutationField("ForgotPassword", {
  type: MessageObj,
  args: { data: ForgotPasswordInput },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedInSeller(ctx);

    const seller = await ctx.db.seller.findUnique({
      where: { email: data?.email },
    });
    if (!!seller) {
      //save token to db
      const pwdToken = `${seller.id}${Math.floor(1000 + Math.random() * 9000)}`;
      ctx.db.seller.update({ where: { id: seller.id }, data: { pwdToken } });
      // send token to email
      const token = await jwt.sign(
        pwdToken,
        PASSWORD_VERIFICATION_SECRET as string,
        {
          expiresIn: "24h",
        }
      );
      await forgotPasswordEmail(
        data?.email as string,
        `${ctx.req.headers.host}/forgot_pwd?token=${token}`
      );
    }
    return { message: CONST.messages.forgotPwdEmail };
  },
});

export const VerifyToken = mutationField("VerifyToken", {
  type: MessageObj,
  args: { data: VerificationTokenInput },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedInSeller(ctx);

    const vToken = (await jwt.verify(
      data?.token as string,
      EMAIL_VERIFICATION_SECRET as string
    )) as string;

    if (!vToken) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const seller = await ctx.db.seller.findUnique({ where: { vToken } });
    if (!seller) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    if (seller.verified) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    ctx.db.seller.update({
      where: { id: seller.id },
      data: { vToken: null, verified: true },
    });
    return { message: CONST.messages.emailVerified };
  },
});

export const VerifyPasswordToken = mutationField("VerifyPasswordToken", {
  type: MessageObj,
  args: { data: VerificationTokenInput },
  resolve: async (_, { data }, ctx) => {
    const pwdToken = (await jwt.verify(
      data?.token as string,
      PASSWORD_VERIFICATION_SECRET as string
    )) as string;

    if (!pwdToken) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const seller = await ctx.db.seller.findUnique({ where: { pwdToken } });
    if (!seller) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    if (seller.verified) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    ctx.db.seller.update({
      where: { id: seller.id },
      data: { pwdToken: null },
    });
    return { message: CONST.messages.emailVerified };
  },
});

export const SellerLogin = mutationField("SellerLogin", {
  type: MessageObj,
  args: { data: "LoginInput" },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedInSeller(ctx);
    // validates arguments
    await validateLogin(data);
    // check user credentials
    const seller = await checkSellerLoginCredentials(
      data?.email as string,
      data?.pwd as string
    );
    // set session cookie
    ctx.req.session.seller = seller.id;
    return { message: CONST.messages.logged_in };
  },
});

export const SellerLogout = mutationField("SellerLogout", {
  type: MessageObj,
  resolve: async (_, args, ctx) => {
    if (ctx.seller) {
      ctx.res.clearCookie(SELLER_SESSION_NAME as string);
      ctx.req.session.destroy((err: any) => {
        if (err) throw new Error(CONST.errors.server);
      });
    }
    return { message: CONST.messages.logged_out };
  },
});
