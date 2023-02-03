import { enumType } from "nexus";

export const UserRoleType = enumType({
  name: "UserRole",
  members: {
    USER: 0,
    SELLER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
  },
});
