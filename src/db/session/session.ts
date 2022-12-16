import MongoStore from "connect-mongo";
import { CONST } from "../../@types/conts";

export default async (): Promise<MongoStore> => {
  try {
    return MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      //   touchAfter: 1000 * parseInt(process.env.SESSION_TOUCH as string),
    });
  } catch (error) {
    throw new Error(CONST.errors.server);
  }
};
