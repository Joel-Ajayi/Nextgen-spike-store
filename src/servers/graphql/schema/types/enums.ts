import { enumType } from "nexus";

export const UserRoleType = enumType({
    name: 'UserRole',
    members: ['ADMIN', 'USER'],
  })