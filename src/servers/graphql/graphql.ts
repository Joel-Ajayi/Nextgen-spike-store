import { Application } from "express";
import { ApolloServer } from "apollo-server-express";

// @ts-ignore: Unreachable code error
import GraphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import { schema } from "./schema/index";
import "dotenv/config";
import { createContext } from "./schema/context";

export default async (app: Application) => {
  // graphql files
  app.use(GraphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 4 }));
  const server = new ApolloServer({
    schema,
    context: createContext,
  });

  await server.start();

  await server.applyMiddleware({
    app,
    path: "/api/graphql",
    cors: {
      origin: [
        process.env.CLIENT_URL as string,
        "https://studio.apollographql.com",
      ],
      credentials: true,
      methods: ["POST", "GET"],
    },
  });
};
