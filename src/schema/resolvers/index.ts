import GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import Mutation from "./Mutation";
import Query from "./Query";
import scalar from "../customTypes";

const resolvers = {
  Upload: GraphQLUpload,
  UploadOrUrl: scalar.UploadOrUrl,
  StringOrInt: scalar.StringOrInt,
  AnyExceptNull: scalar.AnyExceptNull,
  Query,
  Mutation,
};
export default resolvers;
