import { User } from "@prisma/client";
import { ExpressContext } from "apollo-server-express";
import { GraphQLError } from "graphql";
import { CONST } from "../@types/conts";
import { prisma as db } from "../db/prisma/connect";
import { Context } from "../schema/context";

export async function createContext({
  req,
  res,
}: ExpressContext): Promise<Context> {
  // gets user from session
  const userId = req.session.user;
  let user: User | null = null;

  try {
    if (userId) {
      user = (await db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          fName: true,
          lName: true,
          username: true,
          avatar: true,
          role: true,
          contactNumber: true,
        },
      })) as User | null;
    }
  } catch (error) {
    throw new Error(CONST.errors.unknown);
  }

  return { req, res, db, user };
}

export const checkUser = (ctx: Context) => {
  if (!ctx.user) {
    throw new GraphQLError(CONST.errors.login, {
      extensions: {
        statusCode: 401,
      },
    });
  }
};

export const checkSeller = (ctx: Context) => {
  checkUser(ctx);
  if (ctx.user && ctx.user.role < 1) {
    throw new GraphQLError(CONST.errors.unAuthorized, {
      extensions: {
        statusCode: 403,
      },
    });
  }
};

export const checkAdmin = (ctx: Context) => {
  checkUser(ctx);
  if (ctx.user && ctx.user.role < 2) {
    throw new GraphQLError(CONST.errors.unAuthorized, {
      extensions: {
        statusCode: 403,
      },
    });
  }
};

export const checkSuperAdmin = (ctx: Context) => {
  checkUser(ctx);
  if (ctx.user && ctx.user.role < 3) {
    throw new GraphQLError(CONST.errors.unAuthorized, {
      extensions: {
        statusCode: 403,
      },
    });
  }
};
