import MongoStore from "connect-mongo";
import consts from "../../@types/conts";

export default async (): Promise<MongoStore> => {
  try {
    return MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      touchAfter: parseInt(process.env.SESSION_TOUCH as string),
    });
  } catch (error) {
    throw new Error(consts.errors.server);
  }
};
