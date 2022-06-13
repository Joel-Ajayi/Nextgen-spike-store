import { enumType } from "nexus";

export const signUpType = enumType({
    name: 'SignUpType',
    members: ['ADMIN', 'USER'],
  })