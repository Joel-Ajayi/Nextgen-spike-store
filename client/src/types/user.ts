export enum SignInFieds {
  Email = "email",
  Pwd = "pwd",
  Fname = "fName",
  Lname = "lName",
}

export type SignInForm = {
  [key in SignInFieds]?: { value: ""; err: "" };
};

export enum Roles {
  User = 0,
  Product = 1,
  Order = 2,
  CategoryAndBrand = 3,
  SuperAdmin = 4,
  Global = 5,
}

export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  roles: Roles[];
  fName: string;
  lName: string;
  avatar: string | null;
  contactNumber?: string | null;
}
