import { enumType } from "nexus";

export const UserRoleType = enumType({
  name: "UserRole",
  members: {
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2,
  },
});
