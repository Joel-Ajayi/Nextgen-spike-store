import { PrismaClient, User } from "@prisma/client";
import { ExpressContext } from "apollo-server-express";
import { Request, Response } from "express";
import { prisma as db } from "../db/prisma/connect";
import consts from "../@types/conts";

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
          fName: true,
          lName: true,
          avatar: true,
          role: true,
          contactNumber: true,
        },
      })) as User;
    }
  } catch (error) {
    throw new Error(consts.errors.server);
  }

  return { req, res, db, user };
}
