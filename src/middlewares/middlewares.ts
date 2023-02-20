import { PrismaClient, User } from "@prisma/client";
import { GraphQLError } from "graphql";
import { CONST } from "../@types/conts";
import { prisma as db } from "../db/prisma/connect";
import { Context } from "../schema/context";
import bcrypt from "bcryptjs";
import { SellerRoles } from "../@types/User";

export const checkUser = (ctx: Context) => {
  if (!ctx.user?.id) {
    throw new GraphQLError(CONST.errors.signIn, {
      extensions: {
        statusCode: 401,
      },
    });
  }
};

export const checkSeller = (ctx: Context) => {
  if (!ctx.seller?.id) {
    throw new GraphQLError(CONST.errors.unAuthorized, {
      extensions: {
        statusCode: 403,
      },
    });
  }
};

export const checkSellerAdmin = (ctx: Context) => {
  checkSeller(ctx);
  if (ctx.seller?.role !== SellerRoles.Seller) {
    throw new GraphQLError(CONST.errors.signIn, {
      extensions: {
        statusCode: 401,
      },
    });
  }
};

export const checkSellerSuperAdmin = (ctx: Context) => {
  checkSeller(ctx);
  if (ctx.seller?.role === SellerRoles.SUPER_ADMIN) {
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

export const checkSellerLoginCredentials = async (
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

export const alreadySignedUpSeller = async (
  email: string
): Promise<boolean> => {
  const seller = await db.seller.findUnique({ where: { email } });
  if (seller) true;
  return false;
};

export const alreadySignedInSeller = async (ctx: Context): Promise<void> => {
  if (ctx.seller?.id) {
    throw new GraphQLError(CONST.errors.invalidSignIn, {
      extensions: {
        statusCode: 400,
      },
    });
  }
};
