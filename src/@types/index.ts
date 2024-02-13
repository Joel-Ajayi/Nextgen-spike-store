import { Stream } from "stream";

export interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

export type Message = {
  message: string;
};

export type Pagination<T> = {
  skip: number;
  page: number;
  numPages: number;
  count: number;
  take: number;
  list: T[];
};
