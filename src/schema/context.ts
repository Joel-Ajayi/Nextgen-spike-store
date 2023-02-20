import { PrismaClient, Seller, User } from "@prisma/client";
import { ExpressContext } from "apollo-server-express";
import { Request, Response } from "express";
import { CONST } from "../@types/conts";
import { prisma as db } from "../db/prisma/connect";

export type Context = {
  user: User;
  seller: Seller;
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
  const sellerId = req.session.seller;
  let user: User = {} as any;
  let seller: Seller = {} as any;

  try {
    if (userId) {
      user = (await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          contactNumber: true,
        },
      })) as User;
    }

    if (sellerId) {
      seller = (await db.seller.findUnique({
        where: { id: sellerId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          contactNumber: true,
        },
      })) as Seller;
    }
  } catch (error) {
    throw new Error(CONST.errors.unknown);
  }

  return { req, res, db, user, seller };
}
