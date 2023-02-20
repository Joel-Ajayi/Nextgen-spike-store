import { PrismaClient, User } from "@prisma/client";
import { GraphQLError } from "graphql";
import { CONST } from "../@types/conts";
import { prisma as db } from "../db/prisma/connect";
import { Context } from "../schema/context";
import bcrypt from "bcryptjs";
import { Roles } from "../@types/User";

export const checkUser = (ctx: Context) => {
  if (!ctx.user?.id) {
    throw new GraphQLError(CONST.errors.signIn, {
      extensions: {
        statusCode: 401,
      },
    });
  }
};

export const checkAdmin = (ctx: Context) => {
  checkUser(ctx);
  if (ctx.user?.role !== Roles.Admin) {
    throw new GraphQLError(CONST.errors.signIn, {
      extensions: {
        statusCode: 401,
      },
    });
  }
};

export const checkSuperAdmin = (ctx: Context) => {
  checkUser(ctx);
  if (ctx.user?.role === Roles.SUPER_ADMIN) {
    throw new GraphQLError(CONST.errors.unAuthorized, {
      extensions: {
        statusCode: 403,
      },
    });
  }
};

export const checkLoginCredentials = async (
  email: string,
  password: string
): Promise<User> => {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    throw new GraphQLError(CONST.errors.invalidSignIn, {
      extensions: {
        statusCode: 400,
      },
    });
  }

  const isMatched = await bcrypt.compare(password, user.pwd);
  if (!isMatched) {
    throw new GraphQLError(CONST.errors.invalidSignIn, {
      extensions: {
        statusCode: 400,
      },
    });
  }
  return user;
};

export const alreadySignedUp = async (
  email: string,
  db: PrismaClient
): Promise<void> => {
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    throw new GraphQLError(CONST.errors.userAlreadyExist, {
      extensions: {
        statusCode: 400,
      },
    });
  }
};

export const alreadySignedIn = async (ctx: Context): Promise<void> => {
  if (ctx.user?.id) {
    throw new GraphQLError(CONST.errors.alreadySignedIn, {
      extensions: {
        statusCode: 400,
      },
    });
  }
};
