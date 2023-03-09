import fs from "fs";
import path from "path";
import axios from "axios";
import { nanoid } from "nanoid";
import { CategoryType, CatFilterType } from "@prisma/client";
import { GraphQLError } from "graphql";
import { FileUpload } from "graphql-upload/Upload";
import { Stream } from "stream";
import { string, object, array, boolean, mixed } from "yup";
import { CategoryForm } from "../@types/Category";
import { CONST } from "../@types/conts";

class Validator {
  private email() {
    return string().required("Invalid email").email("Invalid email");
  }

  private pwd() {
    return string()
      .required("Password is required")
      .min(8, "Password should be 8 chars minimum")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        {
          message:
            "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
        }
      );
  }

  public async signIn(data: any) {
    try {
      await object({ email: this.email(), pwd: this.pwd() }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: {
          statusCode: 400,
        },
      });
    }
  }

  private async image(
    img: Promise<FileUpload>,
    b64s: string[],
    prevUploadedB64s: { filePath: string; b64: string }[] = []
  ) {
    const maxSize = CONST.files.imgSize;
    const { mimetype, createReadStream, filename } = await img;
    const rvBs64Type = (str: string) => str.replace(/^data:(.*,)?/, "");

    const types = CONST.files.mimeType.supportedImg;
    if (!types.includes(mimetype)) {
      throw new GraphQLError(CONST.errors.files.inCorrectImageFormat, {
        extensions: { statusCode: 400 },
      });
    }

    const chunks: any = [];
    const stream = createReadStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const b64 = rvBs64Type(buffer.toString("base64"));
    if (buffer.byteLength > maxSize) {
      throw new GraphQLError(
        `${CONST.errors.files.exceededMaxSize} ${(
          CONST.files.imgSize / 1024
        ).toFixed(0)}kb`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    const duplicateFilePath = prevUploadedB64s.find(
      (upload) => upload.b64 === b64
    );
    if (!!duplicateFilePath) return duplicateFilePath;

    if (b64s.includes(b64)) {
      throw new GraphQLError(CONST.errors.files.duplicate, {
        extensions: { statusCode: 400 },
      });
    }
    return { filename, stream: createReadStream, b64 };
  }

  private async video(
    vd: Promise<FileUpload>,
    b64s: string[],
    prevUploadedB64s: { filePath: string; b64: string }[] = []
  ) {
    const maxSize = CONST.files.vdSize;
    const { mimetype, createReadStream, filename } = await vd;
    const rvBs64Type = (str: string) => str.replace(/^data:(.*,)?/, "");

    const types = CONST.files.mimeType.supportedVd;
    if (!types.includes(mimetype)) {
      throw new GraphQLError(CONST.errors.files.inCorrectVideoFormat, {
        extensions: { statusCode: 400 },
      });
    }

    const chunks: any = [];
    const stream = createReadStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const b64 = rvBs64Type(buffer.toString("base64"));
    if (buffer.byteLength > maxSize) {
      throw new GraphQLError(
        `${CONST.errors.files.exceededMaxSize} ${(
          maxSize /
          (1024 * 1024)
        ).toFixed(0)}mb`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    const duplicateFilePath = prevUploadedB64s.find(
      (upload) => upload.b64 === b64
    );
    if (!!duplicateFilePath) return duplicateFilePath;

    if (b64s.includes(b64)) {
      throw new GraphQLError(CONST.errors.files.duplicate, {
        extensions: { statusCode: 400 },
      });
    }
    return { filename, b64, stream: createReadStream };
  }

  public async files(
    files: Promise<FileUpload>[],
    maxNum: number,
    minNum: number,
    type: "video" | "image" = "image",
    prevFiles: string[] = []
  ) {
    if (files.length < minNum) {
      throw new GraphQLError(
        `${CONST.errors.files.leastFileUpload} ${minNum}`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    if (files.length > maxNum) {
      throw new GraphQLError(
        `${CONST.errors.files.exceededMaxNumber} ${maxNum}`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    let currentIndex = 0;
    let prevB64s: { filePath: string; b64: string }[] = [];
    const b64s: {
      filename?: string;
      b64?: string;
      stream?: () => Stream;
      filePath?: string;
    }[] = [];

    if (prevFiles.length) {
      await Promise.all(
        prevFiles.map(async (link) => {
          try {
            const b64 = (
              (await new Promise((resolve, reject) => {
                fs.readFile(path.join(__dirname, `../${link}`), (err, data) => {
                  if (err) {
                    reject(null);
                  } else {
                    resolve(data);
                  }
                });
              })) as Buffer
            )
              .toString("base64")
              .replace(/^data:(.*,)?/, "");
            prevB64s.push({ b64, filePath: link });
          } catch (error) {
            throw new GraphQLError(CONST.errors.server, {
              extensions: { statusCode: 400 },
            });
          }
        })
      );
    }

    // validate each file
    await Promise.all(
      files.map(async (file, i) => {
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (currentIndex === i) {
              clearInterval(interval);
              resolve(null);
            }
          }, 20);
        });

        const comparableB64s = b64s.map(({ b64 }) => b64 || "");
        const valifationFunc =
          type !== "video" ? await this.image : await this.video;
        const b64 = await valifationFunc(file, comparableB64s, prevB64s);
        if ((b64 as any)?.filePath) {
          prevB64s = prevB64s.filter((prev) => prev.b64 !== b64.b64);
        }
        if (!!b64) b64s.push(b64);
        currentIndex++;
      })
    );

    // delete prevFiles if any
    if (prevB64s.length) {
      await this.deleteFiles(prevB64s.map(({ filePath }) => filePath));
    }

    // // return file paths
    const filePaths = await Promise.all(
      b64s.map(async (item) => {
        if (item.filePath) return item.filePath;
        const basePath = type === "video" ? "uploads/vd/" : "uploads/img/";
        const { ext } = path.parse(item.filename as string);
        const filePath = `${basePath}${nanoid()}${ext}`;
        const fileStream = await fs.createWriteStream(
          path.join(__dirname, `../${filePath}`)
        );

        try {
          await new Promise((resolve, reject) => {
            if (item.stream) {
              item
                .stream()
                .pipe(fileStream)
                .on("error", () => {
                  reject();
                })
                .on("finish", () => resolve(""));
            }
          });
        } catch (error) {
          throw new GraphQLError(
            "An error occured when uploading files. Please try again",
            {
              extensions: { statusCode: 400 },
            }
          );
        }
        return filePath;
      })
    );
    return filePaths as string[];
  }

  public async deleteFiles(paths: string[]) {
    try {
      await Promise.all(
        paths.map(async (filePath) => {
          await new Promise((resolve, reject) => {
            fs.unlink(path.join(__dirname, `../${filePath}`), (err) => {
              if (err) reject("An error occured. Please try again");
              resolve(path);
            });
          });
        })
      );
    } catch (error) {
      throw new GraphQLError(CONST.errors.server, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async category(val: CategoryForm, isUpdate = false) {
    const filterObj = {
      name: string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .max(10, "Name should have not more than 10 characters"),
      unit: string()
        .max(5, "Unit should have not more than 5 characters")
        .nullable(),
      isRequired: boolean().required("Required field is not provided"),
      type: mixed()
        .oneOf(Object.values(CatFilterType), "Please provide valid filter type")
        .required("Please provide filter type"),
      options: array()
        .of(string().max(10, "Option should have not more than 10 characters"))
        .nullable()
        .max(10, "Options should not be more than 10"),
    };

    const obj = {
      name: string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9\s]*$/, "Special characters not allowed")
        .max(12, "Name should have not more than 12 characters"),
      description: string()
        .required("Description Field is empty")
        .max(110, "Description should have not more than 110 characters"),
      image: mixed().nullable(),
      banners: array().nullable().of(mixed()),
      filters: array(
        object(
          isUpdate
            ? {
                id: string().required("Filter Id not provided"),
                ...filterObj,
              }
            : filterObj
        )
      ).max(5, "Filters should not be more than 5"),
    };

    try {
      await object(
        isUpdate
          ? { id: string().required("Category ID not provided"), ...obj }
          : { ...obj, parent: string().nullable() }
      ).validate(val);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: {
          statusCode: 400,
        },
      });
    }
  }

  public async categoryParent(name: string, parent: string) {
    try {
      await object({
        name: string().required("Category Name is required"),
        parent: string().required("Category Parent Name is required"),
      }).validate({ name, parent });
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: {
          statusCode: 400,
        },
      });
    }
  }
}

export const validator = new Validator();
