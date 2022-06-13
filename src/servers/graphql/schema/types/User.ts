import { queryType } from "nexus";

export const User = queryType({
  definition(t) {
    t.field("hey", {
      type: "String",
      resolve: async (_, arg, ctx) => {
        console.log(ctx.user);
        if (!ctx.user) {
          ctx.req.session.user = "62a3ce4c79b0d28e0537ee47";
        }
        // await ctx.db.user.create({
        //   data: {
        //     lname: "hey",
        //     fname: "k,fdj",
        //     email: ".kdfjkd@gmail.com",
        //     username: "kfdjfj",
        //     password: "klfjkfj",
        //   },
        // });
        return "user created";
      },
    });
  },
});
