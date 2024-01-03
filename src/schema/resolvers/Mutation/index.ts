import users from "./users";
import categories from "./categories";
import products from "./products";
import brands from "./brands";

const resolvers = { ...users, ...categories, ...products, ...brands };
export default resolvers;
