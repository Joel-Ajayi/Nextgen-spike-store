export interface IAppInitailState {
  showModal: boolean;
  isLoading: boolean;
  requestTimeout: boolean;
  statusCode: number;
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
  statusCode?: number;
  type: MessageType | null;
  header?: string | "";
  transitionFrom?: "left" | "right" | "bottom" | "top" | "";
}

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
  b64: string;
}

export type Brand = {
  name: string;
  image: IFile[];
};
