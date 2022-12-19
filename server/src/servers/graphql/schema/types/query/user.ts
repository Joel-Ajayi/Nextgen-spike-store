import { AuthenticationError } from "apollo-server-express";
import { queryField } from "nexus";
import { CONST } from "../../../../../@types/conts";
import { UserObj } from "../objects";

export const userQuery = queryField("userQuery", {
  type: UserObj,
  resolve(_, args, ctx) {
    if (!ctx.user) {
      throw new AuthenticationError(CONST.errors.unAuthenticated, {
        statusCode: 401,
      });
    }
    return ctx.user;
  },
});
