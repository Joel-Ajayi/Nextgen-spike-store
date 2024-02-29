import users from "./users";
import categories from "./categories";
import products from "./products";
import brands from "./brands";
import global from "./global";

const resolvers = {
  ...users,
  ...categories,
  ...products,
  ...brands,
  ...global,
};
export default resolvers;
