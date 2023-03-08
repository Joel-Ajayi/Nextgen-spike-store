import { queryField } from "nexus";
import middleware from "../../../middlewares/middlewares";
import { UserObj } from "../objects";

export const UserQuery = queryField("UserQuery", {
  type: UserObj,
  resolve(_, args, ctx) {
    middleware.checkUser(ctx);
    return {
      ...ctx.user,
      avatar: ctx.user.avatar || "",
    };
  },
});
