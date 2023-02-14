import { objectType } from "nexus";

export const MessageObj = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.field("message", { type: "String" });
  },
});

export const SellerObj = objectType({
  name: "Seller",
  definition(t) {
    t.nonNull.field("id", { type: "ID" });
    t.nonNull.field("email", { type: "String" });
    t.nonNull.field("fName", { type: "String" });
    t.nonNull.field("lName", { type: "String" });
    t.nonNull.field("username", { type: "String" });
    t.nonNull.field("role", { type: "Int" });
    t.nonNull.field("contactNumber", { type: "String" });
    t.nullable.field("avatar", { type: "String" });
  },
});
