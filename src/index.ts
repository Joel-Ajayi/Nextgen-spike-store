import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import graphql from "./servers/graphql/graphql";
import 'dotenv/config';

const { PORT } = process.env;

(async () => {
  const app: Application = express();
  app.use(morgan("dev"));

  // set up cors
  app.use(cors({ origin: [process.env.CLIENT_URL as string, 'https://studio.apollographql.com'], credentials: true }));
  
  // servers
  await graphql(app)

  app.listen({ port: PORT }, () => {
    console.log(`Server started at PORT ${process.env.PORT}`);
  });
})();
