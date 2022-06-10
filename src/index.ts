import express, { Application } from "express";
import morgan from "morgan";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import graphql from "./servers/graphql/graphql";
import "dotenv/config";
import https from "https";
import fs from "fs";
import { join } from "path";
// @ts-ignore: Unreachable code error
import cookieParser from "cookie-parser";
// @ts-ignore: Unreachable code error
import csurf from "csurf";

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

  app.use(morgan("dev"));
  app.use(cookieParser());
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
        sameSite: "none",
        secure: true,
      },
    })
  );

  const options = {
    key: fs.readFileSync(join(__dirname, "../config/key.pem")),
    cert: fs.readFileSync(join(__dirname, "../config/cert.pem")),
  };

  const httpServer = https.createServer(options, app);

  // graphql servers
  await graphql(app, httpServer);

  httpServer.listen(PORT, () =>
    console.log(`Server started at PORT ${process.env.PORT}`)
  );
})();
