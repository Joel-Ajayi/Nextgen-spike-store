import { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import "dotenv/config";
import { appContext as context } from "./schema/context";
import consts from "./@types/conts";
import typeDefs from "./schema/schema.graphql";
import resolvers from "./schema/resolvers";

export default async (app: any) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cors = {
    origin: consts.request.origins,
    credentials: true,
    methods: consts.request.methods,
  };

  // graphql files
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    cache: "bounded",
    csrfPrevention: true,
  });
  await server.start();
  await server.applyMiddleware({ app, path: "/api", cors });
};
