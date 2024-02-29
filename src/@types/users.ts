export enum Roles {
  User = 0,
  Product = 1,
  Order = 2,
  CategoryAndBrand = 3,
  SuperAdmin = 4,
  Global = 5,
}

export type User = {
  avatar: String;
  contactNumber: number | null;
  email: String;
  fName: String;
  id: String;
  lName: String;
  roles: number[];
};

export type SignIn_I = {
  email: string;
  pwd: string;
};

export interface SignUp_I extends SignIn_I {
  fName: string;
  lName: string;
}
