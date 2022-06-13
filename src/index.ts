import express from "express";
import morgan from "morgan";
import session from "express-session";
import graphql from "./servers/graphql/graphql";
import "dotenv/config";
import https from "https";
import fs from "fs";
import { join } from "path";
// @ts-ignore: Unreachable code error
import cookieParser from "cookie-parser";
import initRedis from "./db/redis/init";
const { PORT, SESSION_NAME, SESSION_SECRET, SESSION_LIFETIME } = process.env;

declare module "express-session" {
  interface SessionData {
    user: string;
  }
}

(async () => {
  // init redis store
  const { redisClient, RedisStore } = await initRedis();

  const app = express();
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
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * parseInt(SESSION_LIFETIME as string),
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
