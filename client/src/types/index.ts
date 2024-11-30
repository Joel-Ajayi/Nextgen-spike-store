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
  headerData: HeaderData;
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

export type APIPagination<T> = {
  count: number;
  take: number;
  page: number;
  numPages: number;
  skip: number;
  list: T[];
};

export interface Pagination<T> {
  count: number;
  take: number;
  page: number;
  numPages: number;
  skip: number;
  list: { [key in number]: T[] };
}

export type SearchResponse = {
  id: string;
  name: string;
  type: number;
};

export type LandingPageData = {
  banners: CategoryBanner[];
  offers: (CategoryOffer | null)[];
  topCategories: (null | CategoryMini)[];
  hotDeals: (null | ProductMini)[];
  newProducts: (null | ProductMini)[];
  popularProducts: (null | ProductMini)[];
};

export type HeaderData = {
  categories: CategoryMicro[];
  topCategories: CategoryMini[];
  searchResultTypes: number[];
};

export enum ID {
  new = "new",
}

export enum SearchResultType {
  Brand,
  Category,
  Product,
}

export enum Paths {
  Home = "/",
  Catalog = "/catalog",
  Product = "/product",
  Profile = "/profile",
  WishList = "/WishList",
  ForgotPass = "/forgot_pass",
  Cart = "/cart",
  Checkout = "/checkout",
  SignIn = "/signIn",
  Controller = "/controller",
}

export enum CatalogQuery {
  SortBy = "sort_by",
  Search = "search",
  Category = "category",
  Colours = "colours",
  Brand = "brand",
  Discount = "discount",
  Price = "price",
  PriceRange = "price_range",
  Rating = "rating",
  Offer = "offer",
  Page = "page",
  Filters = "filters",
}

export enum CatalogSortQueries {
  Newest_Arrivals = "newest",
  Popularity = "popular",
  Hot_Deals = "hotdeals",
  Price_Descending = "price_desc",
  Price_Ascending = "price_asc",
  Rating = "rating",
}

export const PublicPaths = [Paths.Home, Paths.Catalog, Paths.Cart];
