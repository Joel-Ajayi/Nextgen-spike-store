import { DropdownProps } from "../components/shared/Dropdown/Dropdown";
import { DropdownItemProps } from "../components/shared/Dropdown/DropdownItem/DropdownItem";
import {
  CategoryBanner,
  CategoryMicro,
  CategoryMini,
  CategoryOffer,
} from "./category";
import { ProductMini } from "./product";

export interface IAppInitailState {
  showModal: boolean;
  isLoading: boolean;
  isPageLoading: boolean;
  requestTimeout: boolean;
  statusCode: number;
  networkError: boolean;
  message: IMessage;
  landingPageData: LandingPageData;
}

export enum MessageType {
  NotFound,
  Error,
  Info,
  Success,
}

export interface IMessage {
  msg: string | "";
  statusCode: StatusCodes;
  type: MessageType | null;
  header?: string | "";
  transitionFrom?: "left" | "right" | "bottom" | "top" | "";
}

export enum StatusCodes {
  Ok = 200,
  InvalidInput = 400,
  ServerError = 500,
  UnAuthenticated = 401,
  Forbidden = 403,
  NotFound = 404,
  ServerDown = 503,
}

export const RedirectStatusCodes = [
  StatusCodes.UnAuthenticated,
  StatusCodes.Forbidden,
  StatusCodes.NotFound,
  StatusCodes.ServerDown,
];

export type Message = {
  message: string;
};

export interface IError {
  code?: string | number;
  message: string;
}

export interface ITreeNode {
  id: string;
  level: number;
  name: string;
  appendable?: boolean;
  moveable?: boolean;
  children?: this[];
}

export interface IFile {
  file: File;
  src: string;
  baseUrl: string;
}

export type Brand = {
  id?: string;
  name: string;
  image: (IFile | string)[];
};

export type Pagination<T> = {
  count: number;
  take: number;
  page: number;
  numPages: number;
  skip: number;
  list: T[];
};

export type LandingPageData = {
  banners: CategoryBanner[];
  offers: (CategoryOffer | null)[];
  topCategories: (null | CategoryMini)[];
  hotDeals: (null | ProductMini)[];
  newProducts: (null | ProductMini)[];
  popularProducts: (null | ProductMini)[];
  categories: CategoryMicro[];
};

export enum Paths {
  Home = "/",
  Products = "/products",
  Product = "product",
  Profile = "/profile",
  Cart = "cart",
  Checkout = "checkout",
  SignIn = "/signIn",
  Controller = "/controller",
}

export const PublicPaths = [Paths.Home, Paths.Products, Paths.Cart];
