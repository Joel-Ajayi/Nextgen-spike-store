import { enumType } from "nexus";

export const userRoleType = enumType({
  name: "userRole",
  members: {
    USER: 0,
    SELLER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  },
});
