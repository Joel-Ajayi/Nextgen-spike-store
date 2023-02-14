import express from "express";
import morgan from "morgan";
import session from "express-session";
import graphql from "./graphql";
import "dotenv/config";
import https from "https";
import fs from "fs";
import path, { join } from "path";
// @ts-ignore: Unreachable code error
import cookieParser from "cookie-parser";
import initSessionStore from "./db/session/session";
const {
  PORT,
  SESSION_NAME,
  SELLER_SESSION_NAME,
  SESSION_SECRET,
  SELLER_SESSION_SECRET,
  SESSION_LIFETIME,
  NODE_ENV,
} = process.env;

declare module "express-session" {
  interface SessionData {
    user: string;
    seller: string;
  }
}

(async () => {
  // init session store
  const sessionStore = await initSessionStore();

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  if (NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  // session setup
  app.use(
    "/api",
    session({
      store: sessionStore,
      name: SESSION_NAME,
      secret: SESSION_SECRET as string,
      rolling: true,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * parseInt(SESSION_LIFETIME as string),
        sameSite: NODE_ENV === "production",
        secure: true,
      },
    })
  );

  app.use(
    "/api/seller",
    session({
      store: sessionStore,
      name: SELLER_SESSION_NAME,
      secret: SELLER_SESSION_SECRET as string,
      rolling: true,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * parseInt(SESSION_LIFETIME as string),
        sameSite: NODE_ENV === "production",
        secure: true,
      },
    })
  );

  const options = {
    key: fs.readFileSync(join(__dirname, "../../../../key.pem")),
    cert: fs.readFileSync(join(__dirname, "../../../../cert.pem")),
  };
  const httpServer = https.createServer(options, app);

  // graphql servers
  await graphql(app);
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "../client/build/index.html"))
  );
  httpServer.listen(PORT, () =>
    console.log(`Server started at PORT ${process.env.PORT}`)
  );
})();
