import { GraphQLScalarType } from "graphql";

const checkDate = (val: any) => {
  const rg = /^\d{2}-\d{3}$/;
  const isValid = typeof val === "string" && rg.test(val);
  if (!isValid) throw new Error("Date format should be in MM-YYYY");
  return val;
};

const Date = new GraphQLScalarType({
  name: "Date",
  description: "A date type",
  serialize: checkDate,
  parseValue: checkDate,
  parseLiteral: (ast: any) => checkDate(ast.value),
});

export default Date;
