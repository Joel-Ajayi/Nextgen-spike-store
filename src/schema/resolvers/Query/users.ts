import { AddressTypes } from "../../../@types/users";
import middleware from "../../../middlewares/middlewares";
import { Context } from "../../context";
import consts from "../../../@types/conts";
import helpers from "../../../helpers";

const resolvers = {
  UserQuery: async (_: any, a: any, ctx: Context) => {
    middleware.checkUser(ctx);

    try {
      const addresses = await ctx.db.address.findMany({
        where: { userId: ctx.user.id },
        select: {
          id: true,
          name: true,
          state: true,
          city: true,
          locality: true,
          address: true,
          addressType: true,
          tel: true,
        },
      });

      return {
        ...ctx.user,
        addresses: addresses.map((a) => ({
          ...a,
          isNew: false,
          tel: a.tel.toString().replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3"),
        })),
        addressTypes: helpers.getObjKeys<string>(AddressTypes),
        avatar: ctx.user.avatar || "",
        states: consts.users.states,
      };
    } catch (error) {
      helpers.error(error);
    }
  },
};
export default resolvers;
