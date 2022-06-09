import express, { Application, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import graphql from "./servers/graphql/graphql";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const {
  PORT,
  NODE_ENV,
  REDIS_PASS,
  REDIS_URL,
  REDIS_USERNAME,
  SESSION_NAME,
  SESSION_SECRET,
  SESSION_LIFETIME,
} = process.env;

(async () => {
  const app: Application = express();

  // connect redis
  const RedisStore = connectRedis(session);
  const client = await redis.createClient({
    password: REDIS_PASS,
    url: REDIS_URL,
    username: REDIS_USERNAME,
  });

  // connect prisma and mongodb
  const prisma = new PrismaClient();
  try {
    // Connect the client
    await prisma.$connect();
  } catch (error) {
    // disconnect the client
    await prisma.$disconnect();
    throw new Error("An error occured in the server");
  }

  app.use(morgan("dev"));
  // session setup
  app.use(
    session({
      store: new RedisStore({ client }),
      name: SESSION_NAME,
      secret: SESSION_SECRET as string,
      rolling: true,
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 60 * 60 * 24 * parseInt(SESSION_LIFETIME as string),
        sameSite: "lax",
        secure: NODE_ENV !== "development" ? true : false,
      },
    })
  );

  // set up cors
  app.use(
    cors({
      origin: [
        process.env.CLIENT_URL as string,
        "https://studio.apollographql.com",
      ],
      credentials: true,
      methods: ["POST"],
    })
  );

  // servers
  await graphql(app, prisma);

  app.listen({ port: PORT }, () => {
    console.log(`Server started at PORT ${process.env.PORT}`);
  });
})();
