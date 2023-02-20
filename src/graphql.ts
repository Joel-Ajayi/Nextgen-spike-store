import { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { userSchema } from "./schema/index";
import "dotenv/config";
import { appContext } from "./schema/context";
import { CONST } from "./@types/conts";
import { NexusGraphQLSchema } from "nexus/dist/core";

export default async (app: Application) => {
  await setUpGraphql(app, userSchema, "/api");
};

const setUpGraphql = async (
  app: Application,
  schema: NexusGraphQLSchema,
  path: string
) => {
  const cors = {
    origin:
      process.env.NODE_ENV === "production" ? undefined : CONST.request.origins,
    credentials: process.env.NODE_ENV !== "production",
    methods: CONST.request.methods,
  };

  // graphql files
  const server = new ApolloServer({
    schema,
    context: appContext,
    csrfPrevention: true,
  });
  await server.start();
  await server.applyMiddleware({ app, path, cors });
};
