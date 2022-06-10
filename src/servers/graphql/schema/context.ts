import { PrismaClient } from "@prisma/client";
import { ExpressContext } from "apollo-server-express";
import { Request, Response } from "express";
import { prisma as db } from "../../../helpers/prisma/connect";

export type Context = {
  user: any;
  req: Request;
  res: Response;
  db: PrismaClient;
};

export function createContext({
  req,
  res,
}: ExpressContext): Context {
  return { req, res, db, user: (req.session as any).user };
}
