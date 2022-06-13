import { createClient } from "redis";
import session from "express-session";
import connectRedis, { RedisStore } from "connect-redis";
import { CONST } from "../@types/conts";
import { RedisClientType } from "@redis/client";

const { REDIS_PASS, REDIS_URL, REDIS_USERNAME } = process.env;

type RedisProps = {
  RedisStore: RedisStore;
  redisClient: RedisClientType;
};

export default async (): Promise<RedisProps> => {
  let RedisStore: RedisStore | null = null;
  let redisClient: RedisClientType | null = null;

  try {
    RedisStore = connectRedis(session);
    redisClient = createClient({
      url: REDIS_URL,
      legacyMode: true,
    });

    await redisClient.connect();
  } catch (error) {
    console.log("redis error", error);
    throw new Error(CONST.errors.database);
  }

  return { redisClient, RedisStore };
};
