import { PrismaClient, User } from "@prisma/client";
import { ExpressContext } from "apollo-server-express";
import { Request, Response } from "express";
import { CONST } from "../@types/conts";
import { prisma as db } from "../db/prisma/connect";

export type Context = {
  user: User;
  req: Request;
  res: Response;
  db: PrismaClient;
};

export async function appContext({
  req,
  res,
}: ExpressContext): Promise<Context> {
  // gets user from session
  const userId = req.session.user;
  let user: User = {} as any;

  try {
    if (userId) {
      user = (await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          role: true,
          contactNumber: true,
        },
      })) as User;
    }
  } catch (error) {
    throw new Error(CONST.errors.server);
  }

  return { req, res, db, user };
}
