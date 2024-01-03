import consts from "../../../@types/conts";
import { Roles, SignIn_I, SignUp_I, User } from "../../../@types/users";
import { validator } from "../../../helpers/validator";
import middleware from "../../../middlewares/middlewares";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Context } from "../../context";
import {
  forgotPasswordEmail,
  userVerificationEmail,
} from "../../../emails/verification";
import { GraphQLError } from "graphql";
import { verifyJWT } from "../../../helpers";
import { Message } from "../../../@types";

const {
  SESSION_NAME,
  EMAIL_VERIFICATION_SECRET,
  PASSWORD_VERIFICATION_SECRET,
  SESSION_NAME_DEV,
  NODE_ENV,
} = process.env;

const resolvers = {
  SignUp: async (
    _: any,
    { data }: { data: SignUp_I },
    ctx: Context
  ): Promise<Message> => {
    await middleware.alreadySignedIn(ctx);
    // validates arguments
    await validator.signIn(data);
    // check if user already exist
    await middleware.alreadySignedUp(data.email, ctx.db);

    // hash password
    const pwd = await bcrypt.hash(data.pwd, 12);

    // user role
    const userCount = await ctx.db.user.count();
    const role = userCount > 1 ? Roles.User : Roles.SuperAdmin;

    try {
      const user = await ctx.db.user.create({
        data: {
          pwd,
          email: data?.email,
          fName: data?.fName,
          lName: data?.lName,
          role,
        },
      });
      // set session cookie
      ctx.req.session.user = user.id;
      return { message: consts.messages.signedUp };
    } catch (error) {
      return { message: consts.errors.server };
    }
  },
  SignIn: async (
    _: any,
    { data }: { data: SignIn_I },
    ctx: Context
  ): Promise<Message> => {
    await middleware.alreadySignedIn(ctx);
    // validates arguments
    await validator.signIn(data);
    // check user credentials
    const user = await middleware.checkLoginCredentials(
      data?.email as string,
      data?.pwd as string
    );
    // set session cookie
    ctx.req.session.user = user.id;
    return { message: consts.messages.signedIn };
  },
  SignOut: async (_: any, args: any, ctx: Context) => {
    if (ctx.user) {
      ctx.res.clearCookie(
        (NODE_ENV === "production" ? SESSION_NAME : SESSION_NAME_DEV) as string
      );
      ctx.req.session.destroy((err: any) => {
        if (err) throw new Error(consts.errors.server);
      });
    }
    return { message: consts.messages.signedOut };
  },
  VerifyAccount: async (
    _: any,
    { email }: { email: string },
    ctx: Context
  ): Promise<Message> => {
    await middleware.checkUser(ctx);

    const user = await ctx.db.user.findUnique({ where: { email } });

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
    return { message: consts.messages.forgotPwdEmail };
  },
  VerifyToken: async (
    _: any,
    { token }: { token: string },
    ctx: Context
  ): Promise<Message> => {
    const vToken = await verifyJWT(token, EMAIL_VERIFICATION_SECRET);
    if (!vToken) {
      throw new GraphQLError(consts.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const user = await ctx.db.user.findUnique({
      where: { vToken: vToken as string },
    });
    if (!user) {
      throw new GraphQLError(consts.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    if (user.verified) {
      throw new GraphQLError(consts.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    ctx.db.user.update({
      where: { id: user.id },
      data: { vToken: null, verified: true },
    });
    return { message: consts.messages.emailVerified };
  },
  ForgotPassword: async (
    _: any,
    { email }: { email: string },
    ctx: Context
  ): Promise<Message> => {
    await middleware.alreadySignedIn(ctx);

    const user = await ctx.db.user.findUnique({
      where: { email: email },
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
        email as string,
        `${ctx.req.headers.host}/forgot_pwd?token=${token}`
      );
    }
    return { message: consts.messages.forgotPwdEmail };
  },
  VerifyPasswordToken: async (
    _: any,
    { token }: { token: string },
    ctx: Context
  ) => {
    const pwdToken = await verifyJWT(token, PASSWORD_VERIFICATION_SECRET);
    if (!pwdToken) {
      throw new GraphQLError(consts.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const user = await ctx.db.user.findUnique({
      where: { pwdToken: pwdToken as string },
    });
    if (!user) {
      throw new GraphQLError(consts.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    ctx.db.user.update({
      where: { id: user.id },
      data: { pwdToken: null },
    });
    return { message: consts.messages.emailVerified };
  },
};
export default resolvers;