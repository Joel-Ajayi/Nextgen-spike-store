import { Application } from "express";
import { ApolloServer } from "apollo-server-express";

// @ts-ignore: Unreachable code error
import GraphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";

import Schema from './schema/index'
import 'dotenv/config';

export default async (app: Application, prisma: any) => {
  // graphql files
  app.use(GraphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 4 }));
  const server = new ApolloServer({
    typeDefs: Schema,
    resolvers: {
      Query: {
        hello: () => {
          return 'hey'
        }
      }
    },
    context: ({ req, res }) => {
      return { req, res, prisma };
    },
  });

  await server.start()

  await server.applyMiddleware({ app, path: "/api/graphql", cors: false });
};
