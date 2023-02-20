export interface IAppInitailState {
  showModal: boolean;
  isLoading: boolean;
  requestTimeout: boolean;
  networkError: boolean;
  message: IMessage;
}

export enum Roles {
  User = 0,
  Admin = 1,
  SuperAdmin = 2,
}

export enum MessageType {
  Error,
  Info,
  Success,
}

export interface IMessage {
  msg: string | "";
  type: MessageType | null;
  header?: string | "";
  transitionFrom?: "left" | "right" | "bottom" | "top" | "";
}

export interface IError {
  code?: string | number;
  message: string;
}

export interface IUserInitailState {
  isAuthenticated?: boolean;
  email: string;
  role: Roles;
  fullName?: string;
  avatar?: string | null;
  contactNumber?: string | null;
}

export interface ISellerInitailState {
  isAuthenticated?: boolean;
  email: string;
  fullName: string;
  displayName: string;
  businessName: string;
  avatar?: string | null;
  contactNumber: string | null;
  role: number;
}
