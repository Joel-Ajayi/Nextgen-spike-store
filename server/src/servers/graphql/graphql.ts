import { Application, NextFunction } from "express";
import { ApolloServer } from "apollo-server-express";

// @ts-ignore: Unreachable code error
import GraphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import { schema } from "./schema/index";
import "dotenv/config";
import { createContext } from "./schema/context";
import { Server } from "https";
import { CONST } from "../../@types/conts";

export default async (app: Application) => {
  // graphql files
  app.use(GraphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 4 }));

  const server = new ApolloServer({
    schema,
    context: createContext,
    csrfPrevention: true,
  });

  await server.start();

  await server.applyMiddleware({
    app,
    path: "/api/graphql",
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL
          : CONST.request.origins,
      credentials: true,
      methods: CONST.request.methods,
    },
  });
};
