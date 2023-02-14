import { queryField } from "nexus";
import { checkSeller } from "../../../../middlewares/middlewares";
import { SellerObj } from "../objects";

export const sellerQuery = queryField("userQuery", {
  type: SellerObj,
  resolve(_, args, ctx) {
    // checkSeller(ctx);
    return ctx.user;
  },
});
