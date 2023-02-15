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
    t.nonNull.field("fullName", { type: "String" });
    t.nonNull.field("displayName", { type: "String" });
    t.nonNull.field("businessName", { type: "String" });
    t.nonNull.field("role", { type: "Int" });
    t.nonNull.field("contactNumber", { type: "String" });
    t.nullable.field("avatar", { type: "String" });
  },
});
