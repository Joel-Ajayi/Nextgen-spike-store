export enum Roles {
  User = 0,
  Admin = 1,
  SuperAdmin = 2,
}

export type User = {
  avatar: String;
  contactNumber: number | null;
  email: String;
  fName: String;
  id: String;
  lName: String;
  role: number;
};

export type SignIn_I = {
  email: string;
  pwd: string;
};

export interface SignUp_I extends SignIn_I {
  fName: string;
  lName: string;
}
