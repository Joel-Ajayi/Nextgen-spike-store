import { AuthenticationError } from "apollo-server-express";
import { mutationField } from "nexus";
import { CONST } from "../../../../@types/conts";
import { checkSeller } from "../../../../middlewares/middlewares";
import { MessageObj } from "../objects";

export const createCategory = mutationField("createCategory", {
  type: MessageObj,
  args: { data: "NewCategoryInput" },
  resolve: async (_, args, ctx) => {
    // checkSeller(ctx);

    // if(!ctx.user.role !== )
    return { message: CONST.messages.user.logged_out };
  },
});
