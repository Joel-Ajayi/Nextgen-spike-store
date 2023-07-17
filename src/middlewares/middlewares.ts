import { PrismaClient, User } from "@prisma/client";
import { GraphQLError } from "graphql";
import { prisma as db } from "../db/prisma/connect";
import consts from "../@types/conts";
import { Context } from "../schema/context";
import bcrypt from "bcryptjs";
import { Roles } from "../@types/User";

class MiddleWare {
  public checkUser(ctx: Context) {
    if (!ctx.user?.id) {
      throw new GraphQLError(consts.errors.signIn, {
        extensions: {
          statusCode: 401,
        },
      });
    }
  }

  public checkAdmin(ctx: Context) {
    this.checkUser(ctx);
    if (ctx.user?.role < Roles.Admin) {
      throw new GraphQLError(consts.errors.signIn, {
        extensions: {
          statusCode: 401,
        },
      });
    }
  }

  public checkSuperAdmin(ctx: Context) {
    this.checkUser(ctx);
    if (ctx.user?.role !== Roles.SuperAdmin) {
      throw new GraphQLError(consts.errors.unAuthorized, {
        extensions: {
          statusCode: 403,
        },
      });
    }
  }

  public async checkLoginCredentials(
    email: string,
    password: string
  ): Promise<User> {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      throw new GraphQLError(consts.errors.invalidSignIn, {
        extensions: {
          statusCode: 400,
        },
      });
    }

    const isMatched = await bcrypt.compare(password, user.pwd);
    if (!isMatched) {
      throw new GraphQLError(consts.errors.invalidSignIn, {
        extensions: {
          statusCode: 400,
        },
      });
    }
    return user;
  }

  public async alreadySignedUp(email: string, db: PrismaClient): Promise<void> {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      throw new GraphQLError(consts.errors.userAlreadyExist, {
        extensions: {
          statusCode: 400,
        },
      });
    }
  }

  public async alreadySignedIn(ctx: Context): Promise<void> {
    if (ctx.user?.id) {
      throw new GraphQLError(consts.errors.alreadySignedIn, {
        extensions: {
          statusCode: 400,
        },
      });
    }
  }
}

const middleware = new MiddleWare();
export default middleware;
