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
import graphqlUpload from "graphql-upload/graphqlUploadExpress.js";
import consts from "./@types/conts";
import axios from "axios";

const {
  PORT,
  SESSION_NAME,
  SESSION_NAME_DEV,
  SESSION_SECRET,
  SESSION_LIFETIME,
  NODE_ENV,
} = process.env;

declare module "express-session" {
  interface SessionData {
    user: string;
  }
}

(async () => {
  const isProduction = NODE_ENV === "production";
  // init session store
  const sessionStore = await initSessionStore();

  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  if (isProduction) {
    app.set("trust proxy", 1);
  }
  app.use(graphqlUpload({ maxFileSize: consts.files.vdSize, maxFiles: 4 }));
  if (NODE_ENV !== "production") app.use(morgan("dev"));

  // session setup
  app.use(
    session({
      store: sessionStore,
      name: NODE_ENV === "production" ? SESSION_NAME : SESSION_NAME_DEV,
      secret: SESSION_SECRET as string,
      rolling: true,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * parseInt(SESSION_LIFETIME as string),
        sameSite: isProduction,
        secure: true,
      },
    })
  );

  // graphql servers
  await graphql(app);
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.use("/uploads/:folder/:filename?", async (req, res) => {
    const { folder, filename } = req.params;
    let baseUrl = `https://res.cloudinary.com/${process.env.IMG_NAME}/image/upload/v1708502714/Profile_Store/${folder}`;
    if (filename) baseUrl += `/${filename}`;
    try {
      const response = await axios.get(baseUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = response.data;
      res.writeHead(200, { "content-type": response.headers["content-type"] });
      res.end(imageBuffer);
    } catch (error) {
      res.sendStatus(400);
    }
  });

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  if (!isProduction) {
    const options = {
      key: fs.readFileSync(join(__dirname, "../../../key.pem")),
      cert: fs.readFileSync(join(__dirname, "../../../cert.pem")),
    };
    const httpServer = https.createServer(options, app);
    httpServer.listen(PORT, () =>
      console.log(`Server started at PORT ${process.env.PORT}`)
    );
  } else {
    app.listen(PORT, () =>
      console.log(`Server started at PORT ${process.env.PORT}`)
    );
  }
})();
