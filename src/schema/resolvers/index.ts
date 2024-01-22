import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import Mutation from "./Mutation";
import Query from "./Query";
import Date from "../customTypes/date";

const resolvers = {
  Upload: GraphQLUpload,
  Date,
  Query,
  Mutation,
};
export default resolvers;
