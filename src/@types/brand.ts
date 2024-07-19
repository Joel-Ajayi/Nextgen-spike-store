import { FileUpload } from "graphql-upload/Upload";

export type Brand = {
  name: string;
  image: string[];
};

export type Brand_I = {
  id: string;
  name: string;
  image: Promise<FileUpload> | null;
};
