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
