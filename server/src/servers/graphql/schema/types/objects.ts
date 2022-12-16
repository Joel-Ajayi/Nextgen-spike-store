import { objectType } from "nexus";

export const Message = objectType({
  name: "Message",
  definition(t) {
    t.nonNull.field("message", { type: "String" });
  },
});
