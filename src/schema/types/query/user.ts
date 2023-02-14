import { queryField } from "nexus";
import { checkUser } from "../../../middlewares/middlewares";
import { UserObj } from "../objects";

export const UserQuery = queryField("UserQuery", {
  type: UserObj,
  resolve(_, args, ctx) {
    checkUser(ctx);
    return { ...ctx.user };
  },
});
