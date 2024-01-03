import { User } from "../../../@types/users";
import middleware from "../../../middlewares/middlewares";
import { Context } from "../../context";

const resolvers = {
  UserQuery: (_: any, a: any, ctx: Context): User => {
    middleware.checkUser(ctx);
    return {
      ...ctx.user,
      avatar: ctx.user.avatar || "",
    };
  },
};
export default resolvers;
