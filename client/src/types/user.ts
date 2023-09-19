import { Roles } from ".";

export enum SignInFieds {
  Email = "email",
  Pwd = "pwd",
  Fname = "fName",
  Lname = "lName",
}

export type SignInForm = {
  [key in SignInFieds]?: { value: ""; err: "" };
};

export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  role: Roles;
  fName: string;
  lName: string;
  avatar: string | null;
  contactNumber?: string | null;
}
