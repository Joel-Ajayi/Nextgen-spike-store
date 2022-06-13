import { PrismaClient, User } from "@prisma/client";
import { ExpressContext } from "apollo-server-express";
import { Request, Response } from "express";
import { CONST } from "../../../@types/conts";
import { prisma as db } from "../../../helpers/prisma/connect";

export type Context = {
  user: User | null;
  req: Request;
  res: Response;
  db: PrismaClient;
};

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
          fname: true,
          username: true,
          avatar: true,
          role: true,
          contactNumber: true,
          password: false,
          passwordReset: false,
        },
      })) as User | null;
    }
  } catch (error) {
    throw new Error(CONST.errors.unknown);
  }

  return { req, res, db, user };
}
