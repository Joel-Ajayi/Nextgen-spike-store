export enum UserPaths {
  Account = "account",
  Orders = "Orders",
  Notifications = "mail",
}

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

export const ControllerRoles = [
  Roles.Product,
  Roles.CategoryAndBrand,
  Roles.Global,
  Roles.Order,
  Roles.SuperAdmin,
];

export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  roles: Roles[];
  fName: string;
  lName: string;
  avatar: string | null;
  contactNumber?: string | null;
}
