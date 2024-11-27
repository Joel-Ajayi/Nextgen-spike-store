export enum UserPaths {
  Account = "account",
  Orders = "Orders",
  Addresses = "Addresses",
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

export type Address = {
  id: string;
  name: string;
  state: string;
  city: string;
  locality: string;
  address: string;
  addressType: number;
  tel: string;
  isNew: boolean;
};

export type State = {
  name: string;
  cities: [
    {
      name: string;
      localities: string[];
    }
  ];
};

export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  roles: Roles[];
  fName: string;
  lName: string;
  avatar: string | null;
  contactNumber?: string | null;
  addresses: Address[];
  states: State[];
  addressTypes: string[];
}
