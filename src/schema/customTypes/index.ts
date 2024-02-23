import { GraphQLError, GraphQLScalarType } from "graphql";
import Upload from "graphql-upload/Upload.js";

class Scalar {
  private checkDate = (val: any) => {
    const rg = /^\d{2}-\d{3}$/;
    const isValid = typeof val === "string" && rg.test(val);
    if (!isValid) throw new Error("Date format should be in MM-YYYY");
    return val;
  };

  public Date = new GraphQLScalarType({
    name: "Date",
    description: "A date type",
    serialize: this.checkDate,
    parseValue: this.checkDate,
    parseLiteral: (ast: any) => this.checkDate(ast.value),
  });

  private checkStringAndInt = (val: any) =>
    typeof val === "string" || typeof val === "number";
  StringOrInt = new GraphQLScalarType({
    name: "StringAndNumber",
    serialize: this.checkStringAndInt,
    parseValue: this.checkStringAndInt,
    parseLiteral: (ast: any) => this.checkStringAndInt(ast.value),
  });

  private checkAnyExceptNull = (val: any) => {
    const isValid = !(typeof val === undefined || typeof val === null);
    if (!isValid) throw new Error("Value must not be null or undefined");
    return val;
  };

  public AnyExceptNull = new GraphQLScalarType({
    name: "AnyExceptNull",
    serialize: this.checkAnyExceptNull,
    parseValue: this.checkAnyExceptNull,
    parseLiteral: (ast: any) => this.checkAnyExceptNull(ast.value),
  });

  private checkUploadAndString = (val: any) => {
    console.log(val);

    const isValid = typeof val === "string";
    if (!isValid) {
      throw new Error("Invalid Image");
    }
    return isValid;
  };

  public UploadOrUrl = new GraphQLScalarType({
    name: "UploadOrUrl",
    parseValue(value) {
      const imgRegex = /^[a-zA-Z]+\/[a-zA-Z0-9_-]+.[a-zA-Z]+$/;
      if (value instanceof Upload) return value.promise;
      if (imgRegex.test(value as string)) return value as string;
      throw new GraphQLError("Upload value invalid.");
    },
    parseLiteral(node) {
      throw new GraphQLError("Upload literal unsupported.", { nodes: node });
    },
    serialize() {
      throw new GraphQLError("Upload serialization unsupported.");
    },
  });
}

const scalar = new Scalar();
export default scalar;
