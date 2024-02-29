import {
  UploadApiOptions,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import { GraphQLError } from "graphql";
import { FileUpload } from "graphql-upload/Upload";
import consts from "../@types/conts";
import { ReadStream } from "fs-capacitor";
import { Readable } from "stream";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

cloudinary.config({
  cloud_name: process.env.IMG_NAME,
  api_key: process.env.IMG_KEY,
  api_secret: process.env.IMG_SECRET,
  secure: true,
});

type File = {
  removeBg: boolean;
  src: string;
  stream?: ReadStream;
};

export type ValidateFileProps = {
  folder: string;
  files: (Promise<FileUpload> | string)[];
  prevFiles: string[];
  minNum: number;
  maxNum: number;
  removeBg?: boolean;
  format?: string;
};

class Upload {
  private async validateImage(
    file: Promise<FileUpload>,
    addedFiles: File[],
    removeBg = false,
    format = ""
  ) {
    const maxSize = consts.files.imgSize;
    const { mimetype, createReadStream } = await file;
    const rvBs64Type = (str: string) => str.replace(/^data:(.*,)?/, "");

    const formats = format ? [format] : consts.files.mimeType.supportedImg;
    if (!formats.includes(mimetype)) {
      throw new Error(consts.errors.files.inCorrectImageFormat);
    }

    const chunks: any = [];
    const stream = createReadStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const src = rvBs64Type(buffer.toString("base64"));
    if (buffer.byteLength > maxSize) {
      throw new Error(
        `${consts.errors.files.exceededMaxSize} ${(
          consts.files.imgSize / 1024
        ).toFixed(0)}kb`
      );
    }

    const duplicateFile = addedFiles.find((upload) => upload.src === src);
    if (duplicateFile) {
      throw new Error(consts.errors.files.duplicate);
    }

    return { stream: createReadStream(), src, removeBg };
  }

  public async deleteFiles(sources: string[]) {
    await Promise.all(
      sources.map(async (src) => {
        const public_id = src.split(".")[0];
        try {
          await cloudinary.uploader.destroy(`Profile_Store/${public_id}`);
        } catch (error) {}
      })
    );
  }

  private async upload(files: File[], folder: string) {
    const fileSources: string[] = [];
    for (let file of files) {
      if (!file?.stream) {
        fileSources.push(file.src);
        continue;
      }

      let options: UploadApiOptions = {
        folder: `Profile_Store/${folder}`,
        // background_removal: "cloudinary_ai",
        // transformation: [{ quality: 80 }],
      };

      let stream = file.stream as Readable;

      if (!file.removeBg) {
        delete options.background_removal;
      } else {
        const formData = new FormData();
        formData.append("size", "auto");
        formData.append("image_file", file.stream as ReadStream);

        const response = await axios.post<Buffer>(
          "https://api.remove.bg/v1.0/removebg",
          formData,
          {
            responseType: "arraybuffer",
            headers: {
              "X-Api-Key": process.env.IMG_BG_KEY,
              ...formData.getHeaders(),
            },
          }
        );
        stream = Readable.from(response.data);
      }

      const response = (await new Promise(async (resolve, reject) => {
        stream.pipe(
          cloudinary.uploader.upload_stream(options, (error, response) => {
            if (error || !response) {
              console.log(error, response);
              throw new GraphQLError("Something went wrong", {
                extensions: { statusCode: 500 },
              });
            }
            resolve(response);
          })
        );
      })) as UploadApiResponse;

      fileSources.push(
        `${response.public_id.split("Profile_Store/")[1]}.${response.format}`
      );
    }
    return fileSources;
  }

  public async files(props: ValidateFileProps) {
    if (props.files.length < props.minNum) {
      throw new GraphQLError(
        `${consts.errors.files.leastFileUpload} ${props.minNum}`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    if (props.files.length > props.maxNum) {
      throw new GraphQLError(
        `${consts.errors.files.exceededMaxNumber} ${props.maxNum}`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    // images uploaded again
    const fileUrls = props.files.filter(
      (f) => typeof f === "string"
    ) as string[];
    // prev images to delete(not uploaded again)
    const deletedFiles = props.prevFiles.filter((f) => !fileUrls.includes(f));

    // validate each file
    const files: File[] = [];
    for (let inputFile of props.files) {
      if (typeof inputFile === "string") {
        files.push({ removeBg: false, src: inputFile });
        continue;
      }

      const removeBg = props?.removeBg;
      const format = props?.format;
      const file = await this.validateImage(inputFile, files, removeBg, format);
      files.push(file);
    }

    // // upload files
    const sources = await this.upload(files, props.folder);
    // delete files
    await this.deleteFiles(deletedFiles);

    return sources;
  }
}

export const upload = new Upload();
