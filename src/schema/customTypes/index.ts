import { GraphQLScalarType } from "graphql";

const checkDate = (val: any) => {
  const rg = /^\d{2}-\d{3}$/;
  const isValid = typeof val === "string" && rg.test(val);
  if (!isValid) throw new Error("Date format should be in MM-YYYY");
  return val;
};

export const Date = new GraphQLScalarType({
  name: "Date",
  description: "A date type",
  serialize: checkDate,
  parseValue: checkDate,
  parseLiteral: (ast: any) => checkDate(ast.value),
});

const checkStringAndInt = (val: any) =>
  typeof val === "string" || typeof val === "number";
export const StringAndInt = new GraphQLScalarType({
  name: "StringAndNumber",
  serialize: checkStringAndInt,
  parseValue: checkStringAndInt,
  parseLiteral: (ast: any) => checkStringAndInt(ast.value),
});

const checkAnyExceptNull = (val: any) => {
  const isValid = !(typeof val === undefined || typeof val === null);
  if (!isValid) throw new Error("Value must not be null or undefined");
  return val;
};
export const AnyExceptNull = new GraphQLScalarType({
  name: "AnyExceptNull",
  serialize: checkAnyExceptNull,
  parseValue: checkAnyExceptNull,
  parseLiteral: (ast: any) => checkAnyExceptNull(ast.value),
});
