import { Roles } from ".";

export enum SignInFieds {
  Email = "email",
  Pwd = "pwd",
}

export type SignInForm = {
  [key in SignInFieds]?: { value: ""; err: "" };
};

export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  role: Roles;
  fullName?: string;
  avatar: string | null;
  contactNumber?: string | null;
}
