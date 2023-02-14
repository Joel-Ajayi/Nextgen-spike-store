import { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { userSchema } from "./schema/index";
import "dotenv/config";
import { appContext } from "./schema/context";
import { CONST } from "./@types/conts";
import { NexusGraphQLSchema } from "nexus/dist/core";
import { sellerSchema } from "./schema/seller";

export default async (app: Application) => {
  await setUpGraphql(app, userSchema, "/api");
  await setUpGraphql(app, sellerSchema, "/api/seller");
};

const setUpGraphql = async (
  app: Application,
  schema: NexusGraphQLSchema,
  path: string
) => {
  const cors = {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : CONST.request.origins,
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
