import Upload, { FileUpload } from "graphql-upload/Upload";

export type Brand = {
  name: string;
  image: String[];
};

export type Brand_I = {
  id: string;
  name: string;
  image: Promise<FileUpload>;
};
