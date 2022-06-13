import { PrismaClient, User } from "@prisma/client";
import { UserInputError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import { CONST } from "../../@types/conts";

export const checkLoginCredentials = async (
  email: string,
  password: string,
  db: PrismaClient
): Promise<User> => {
  const user = await db.user.findUnique({ where: { email } });

  if (!user)
    throw new UserInputError(CONST.errors.invalidLoginCredentials, {
      statusCode: 400,
    });

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched)
    throw new UserInputError(CONST.errors.invalidLoginCredentials, {
      statusCode: 400,
    });

  return user;
};

export const alreadySignedUp = async (
  email: string,
  db: PrismaClient
): Promise<void> => {
  const user = await db.user.findUnique({ where: { email } });
  if (user)
    throw new UserInputError(CONST.errors.userAlreadyExist, {
      statusCode: 400,
    });
};
