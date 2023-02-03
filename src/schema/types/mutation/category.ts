import { AuthenticationError } from "apollo-server-express";
import { mutationField } from "nexus";
import { CONST } from "../../../@types/conts";
import { checkAdmin } from "../../../middlewares/middlewares";
import { MessageObj } from "../objects";

export const createCategory = mutationField("createCategory", {
  type: MessageObj,
  args: { data: "NewCategoryInput" },
  resolve: async (_, args, ctx) => {
    console.log(ctx.user);
    // check if logged_in
    checkAdmin(ctx);

    console.log(args);

    // if(!ctx.user.role !== )
    return { message: CONST.messages.user.logged_out };
  },
});
