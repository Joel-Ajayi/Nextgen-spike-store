import { objectType } from "nexus";

export const MessageObj = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.field("message", { type: "String" });
  },
});

export const UserObj = objectType({
  name: "User",
  definition(t) {
    t.nonNull.field("id", { type: "ID" });
    t.nonNull.field("email", { type: "String" });
    t.nonNull.field("fName", { type: "String" });
    t.nonNull.field("lName", { type: "String" });
    t.nonNull.field("username", { type: "String" });
    t.nonNull.field("role", { type: "Int" });
    t.nullable.field("avater", { type: "String" });
    t.nullable.field("contactNumber", { type: "String" });
  },
});
