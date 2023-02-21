import { mutationField } from "nexus";
import { CONST } from "../../../@types/conts";
import { checkUser } from "../../../middlewares/middlewares";
import { MessageObj } from "../objects";

export const CreateCategory = mutationField("CreateCategory", {
  type: MessageObj,
  args: { data: "NewCategoryInput" },
  resolve: async (_, args, ctx) => {
    console.log(ctx.user);
    // check if logged_in
    checkUser(ctx);

    console.log(args);

    // if(!ctx.user.role !== )
    return { message: CONST.messages.signedIn };
  },
});
