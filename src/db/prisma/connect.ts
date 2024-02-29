import { PrismaClient } from "@prisma/client";
import prismaRandom from "prisma-extension-random";

// Prevent multiple instances of Prisma Client in development
declare const global: { prisma?: PrismaClient };

export const db = new PrismaClient().$extends(prismaRandom());
