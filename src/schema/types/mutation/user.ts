import bcrypt from "bcryptjs";
import { mutationField } from "nexus";
import {
  validateLogin,
  validateSignUp,
} from "../../../helpers/validators/input";
import {
  forgotPasswordEmail,
  userVerificationEmail,
} from "../../../emails/verification";
import { CONST } from "../../../@types/conts";
import { MessageObj } from "../objects";
import {
  SetTokenInput,
  SignInInput,
  SignUpInput,
  VerificationTokenInput,
} from "../inputs";
import {
  alreadySignedIn,
  alreadySignedUp,
  checkLoginCredentials,
  checkUser,
} from "../../../middlewares/middlewares";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { verifyJWT } from "../../../helpers";

const {
  SESSION_NAME,
  EMAIL_VERIFICATION_SECRET,
  PASSWORD_VERIFICATION_SECRET,
} = process.env;

export const SignUp = mutationField("SignUp", {
  type: MessageObj,
  args: { data: SignUpInput },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedIn(ctx);
    // validates arguments
    await validateSignUp(data);
    // check if user already exist
    await alreadySignedUp(data?.email as string, ctx.db);

    const pwd = await bcrypt.hash(data?.pwd as string, 12);
    try {
      const user = await ctx.db.user.create({
        data: { pwd, email: data?.email as string },
      });
      // set session cookie
      ctx.req.session.user = user.id;
      return { message: CONST.messages.signedUp };
    } catch (error) {
      return { message: CONST.errors.server };
    }
  },
});

export const VerifyAccount = mutationField("VerifyAccount", {
  type: MessageObj,
  args: { data: SetTokenInput },
  resolve: async (_, { data }, ctx) => {
    await checkUser(ctx);

    const user = await ctx.db.user.findUnique({
      where: { email: data?.email },
    });

    if (!!user) {
      //save token to db
      const vToken = `${user.id}${Math.floor(1000 + Math.random() * 9000)}`;
      ctx.db.user.update({ where: { id: user.id }, data: { vToken } });

      // send token to email
      const token = await jwt.sign(
        vToken,
        EMAIL_VERIFICATION_SECRET as string,
        {
          expiresIn: "24h",
        }
      );
      await userVerificationEmail(
        user.email,
        `${ctx.req.headers.host}/verify_account?token=${token}`
      );
    }
    return { message: CONST.messages.forgotPwdEmail };
  },
});

export const ForgotPassword = mutationField("ForgotPassword", {
  type: MessageObj,
  args: { data: SetTokenInput },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedIn(ctx);

    const user = await ctx.db.user.findUnique({
      where: { email: data?.email },
    });
    if (!!user) {
      //save token to db
      const pwdToken = `${user.id}${Math.floor(1000 + Math.random() * 9000)}`;
      ctx.db.user.update({ where: { id: user.id }, data: { pwdToken } });
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
    const vToken = await verifyJWT(data?.token, EMAIL_VERIFICATION_SECRET);
    if (!vToken) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const user = await ctx.db.user.findUnique({
      where: { vToken: vToken as string },
    });
    if (!user) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    if (user.verified) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    ctx.db.user.update({
      where: { id: user.id },
      data: { vToken: null, verified: true },
    });
    return { message: CONST.messages.emailVerified };
  },
});

export const VerifyPasswordToken = mutationField("VerifyPasswordToken", {
  type: MessageObj,
  args: { data: VerificationTokenInput },
  resolve: async (_, { data }, ctx) => {
    const pwdToken = await verifyJWT(data?.token, PASSWORD_VERIFICATION_SECRET);
    if (!pwdToken) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const user = await ctx.db.user.findUnique({
      where: { pwdToken: pwdToken as string },
    });
    if (!user) {
      throw new GraphQLError(CONST.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    ctx.db.user.update({
      where: { id: user.id },
      data: { pwdToken: null },
    });
    return { message: CONST.messages.emailVerified };
  },
});

export const SignIn = mutationField("SignIn", {
  type: MessageObj,
  args: { data: SignInInput },
  resolve: async (_, { data }, ctx) => {
    await alreadySignedIn(ctx);
    // validates arguments
    await validateLogin(data);
    // check user credentials
    const user = await checkLoginCredentials(
      data?.email as string,
      data?.pwd as string
    );
    // set session cookie
    ctx.req.session.user = user.id;
    return { message: CONST.messages.signedIn };
  },
});

export const SignOut = mutationField("SignOut", {
  type: MessageObj,
  resolve: async (_, args, ctx) => {
    if (ctx.user) {
      ctx.res.clearCookie(SESSION_NAME as string);
      ctx.req.session.destroy((err: any) => {
        if (err) throw new Error(CONST.errors.server);
      });
    }
    return { message: CONST.messages.signedOut };
  },
});
