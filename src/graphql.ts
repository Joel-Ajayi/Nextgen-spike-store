import { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { schema } from "./schema/index";
import "dotenv/config";
import { createContext } from "./schema/context";
import { CONST } from "./@types/conts";

export default async (app: Application) => {
  // graphql files
  const server = new ApolloServer({
    schema,
    context: createContext,
    csrfPrevention: true,
  });

  await server.start();

  await server.applyMiddleware({
    app,
    path: "/api",
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_URL
          : CONST.request.origins,
      credentials: process.env.NODE_ENV !== "production",
      methods: CONST.request.methods,
    },
  });
};
