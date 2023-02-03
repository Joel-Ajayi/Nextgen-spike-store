import fs from "fs";
import { v4 as uuidv4 } from "uuid";

import path from "path";
import { Upload } from "../../../@types";
import { GraphQLError} from "graphql";
import { CONST } from "../../../@types/conts";
export * from "./user";
export * from "./category";

export const validateFiles = async (
  files: any[],
  type: "image" | "video",
  maxNumber: number = 1,
  minNumber: number = 1
): Promise<Upload[]> => {
  const maxSize =
    type === "image" ? CONST.files.maxImageSize : CONST.files.maxVideoSize;

  if (files.length < minNumber) {
    throw new GraphQLError(
      `${CONST.errors.files.leastFileUpload} ${minNumber}`,
      {
        extensions: { statusCode: 400 },
      }
    );
  }

  if (files.length > maxNumber) {
    throw new GraphQLError(
      `${CONST.errors.files.exceededMaxNumber} ${maxNumber}`,
      {
        extensions: { statusCode: 400 },
      }
    );
  }

  let isSupported = true;
  await Promise.all(
    files.map(async (file) => {
      if (!isSupported) return;

      const stream = (await file) as Upload;
      const mimetypes =
        type === "image"
          ? CONST.files.mimeType.images
          : CONST.files.mimeType.videos;
      if (!mimetypes.includes(stream.mimetype)) isSupported = false;
    })
  );

  if (!isSupported) {
    const msg =
      type === "image"
        ? CONST.errors.files.inCorrectImageFormat
        : CONST.errors.files.inCorrectVideoFormat;
    throw new GraphQLError(msg, { extensions: { statusCode: 400 } });
  }

  return [];
};

export const uploadFiles = async (
  files: any[],
  type: "image" | "video",
  maxNumber: number = 1,
  minNumber: number = 1
) => {
  const maxSize =
    type === "image" ? CONST.files.maxImageSize : CONST.files.maxVideoSize;
  const streams = await validateFiles(files, type, maxNumber, minNumber);
  let exceededMaxSize = false;
  await Promise.all(
    streams.map(async (file) => {
      if (exceededMaxSize) return;
      const fileName = `${uuidv4()}${file.filename}`;
      const filePath = path.join(__dirname, `uploads/${fileName}`);
      await new Promise((resolve) => {
        file
          .createReadStream()
          .pipe(fs.createWriteStream(filePath))
          .on("data", (data: Buffer) => {
            if (data.byteLength > maxSize) {
              fs.unlinkSync(filePath);
              exceededMaxSize = true;
            }
          })
          .on("finish", () => resolve(true))
          .on("error", () => resolve(true));
      });

      if (exceededMaxSize) {
        const msg = `${CONST.errors.files.exceededMaxSize} ${maxSize / 1000}`;
        throw new GraphQLError(msg, { extensions: { statusCode: 400 } });
      }
    })
  );
};
