import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import Mutation from "./Mutation";
import Query from "./Query";
import { StringAndInt, AnyExceptNull } from "../customTypes";

const resolvers = {
  Upload: GraphQLUpload,
  StringAndInt,
  AnyExceptNull,
  Query,
  Mutation,
};
export default resolvers;
