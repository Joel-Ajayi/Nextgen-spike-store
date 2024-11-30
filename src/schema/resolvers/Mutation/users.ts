import consts from "../../../@types/conts";
import {
  Address,
  Roles,
  SignIn_I,
  SignUp_I,
  User,
} from "../../../@types/users";
import { validator } from "../../../helpers/validator";
import middleware from "../../../middlewares/middlewares";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Context } from "../../context";
import { forgotPasswordEmail } from "../../../emails/verification";
import { GraphQLError } from "graphql";
import { Message } from "../../../@types";
import { db } from "../../../db/prisma/connect";
import helpers from "../../../helpers";

const {
  SESSION_NAME,
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
    await middleware.alreadySignedUp(data.email.trim());

    // hash password
    const pwd = await bcrypt.hash(data.pwd, 12);

    try {
      const user = await db.user.create({
        data: {
          pwd,
          email: data?.email,
          fName: data?.fName,
          lName: data?.lName,
          roles: [0],
        },
      });
      // set session cookie
      ctx.req.session.user = user.id;
      return { message: consts.messages.signedUp };
    } catch (error) {
      throw new GraphQLError(consts.errors.server, {
        extensions: { statusCode: 500 },
      });
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
  ForgotPassword: async (
    _: any,
    { email }: { email: string },
    ctx: Context
  ) => {
    await middleware.alreadySignedIn(ctx);

    try {
      const user = await db.user.findUnique({
        where: { email: email },
      });

      if (!!user) {
        //save token to db
        const pwdToken = `${user.id}${Math.floor(1000 + Math.random() * 9000)}`;
        db.user.update({ where: { id: user.id }, data: { pwdToken } });
        // send token to email
        const token = await jwt.sign(
          pwdToken,
          PASSWORD_VERIFICATION_SECRET as string,
          {
            expiresIn: "6h",
          }
        );
        await forgotPasswordEmail(
          email as string,
          `${ctx.req.protocol}://${ctx.req.headers.host}/forgot_pwd?token=${token}`
        );
      }
      return { message: consts.messages.forgotPwdEmail };
    } catch (error) {
      helpers.error(error);
    }
  },
  VerifyPasswordToken: async (
    _: any,
    { token, password }: { token: string; password: string },
    ctx: Context
  ) => {
    await middleware.alreadySignedIn(ctx);

    const pwdToken = await helpers.verifyJWT(
      token,
      PASSWORD_VERIFICATION_SECRET
    );

    if (!pwdToken) {
      throw new GraphQLError(consts.errors.invalidToken, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    try {
      const user = await db.user.findFirst({
        where: { pwdToken: pwdToken as string },
      });

      if (!user) {
        throw new GraphQLError(consts.errors.invalidToken, {
          extensions: {
            statusCode: 400,
          },
        });
      }

      await validator.pwd.validate(password);
      const pwd = await bcrypt.hash(password, 12);

      db.user.update({
        where: { id: user.id },
        data: { pwdToken: null, pwd },
      });
      return { message: consts.messages.passwordChange };
    } catch (error) {
      helpers.error(error);
    }
  },
  UpdateAddress: async (_: any, { data }: { data: Address }, ctx: Context) => {
    // check if logged_in
    middleware.checkUser(ctx);

    // check max
    const validId = helpers.getValidId(data.id);
    const isCreate = validId !== data.id;
    const count = await ctx.db.address.count({
      where: { userId: ctx.user.id },
    });
    if (count >= consts.users.maxAddresses && !isCreate) {
      throw new GraphQLError("Max Addresses Exceeded", {
        extensions: { statusCode: 400 },
      });
    }

    // validate data
    await validator.address(data);

    const { id, isNew, ...address } = data;
    const tel = Number(data.tel.replace(/\s/g, ""));
    const addressData = { ...address, userId: ctx.user.id, tel };

    try {
      const newAddress = await ctx.db.address.upsert({
        where: { id: validId },
        create: addressData,
        update: addressData,
      });

      return newAddress.id;
    } catch (error) {
      helpers.error(error);
    }
  },
};
export default resolvers;
