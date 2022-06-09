import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import graphql from "./servers/graphql/graphql";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const https = require("https");
const fs = require("fs");
const path = require("path");

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
  const redisClient = createClient({
    password: REDIS_PASS,
    url: REDIS_URL,
    username: REDIS_USERNAME,
  });

  redisClient.on("error", (err) => {
    throw new Error("Redis Client Error", err);
  });
  await redisClient.connect();

  // connect prisma and mongodb
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
  } catch {
    await prisma.$disconnect();
    throw new Error("An error occured in the server");
  }

  app.use(morgan("dev"));
  // session setup
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      name: SESSION_NAME,
      secret: SESSION_SECRET as string,
      rolling: true,
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 60 * 60 * 24 * parseInt(SESSION_LIFETIME as string),
        sameSite: "lax",
        secure: true,
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

  const options = {
    key: fs.readFileSync(path.join(__dirname, "../config/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../config/cert.pem")),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`Server started at PORT ${process.env.PORT}`);
  });
})();
