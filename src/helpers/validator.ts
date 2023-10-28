import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { PAYMENTMETHOD } from "@prisma/client";
import { GraphQLError } from "graphql";
import { FileUpload } from "graphql-upload/Upload";
import { Stream } from "stream";
import { string, object, array, boolean, mixed, number, date } from "yup";
import { CatFilterType, CategoryForm } from "../@types/Category";
import conts from "../@types/conts";

class Validator {
  private productFilters = array(
    object({
      id: string(),
      optionId: string().required("Filter option id is required"),
      values: array(string())
        .min(1, "Option values are required")
        .required("Option values are required"),
    })
  ).max(5, "Filters should not be more than 5");

  private email = string().required("Invalid email").email("Invalid email");

  private pwd = string()
    .required("Password is required")
    .min(8, "Password should be 8 chars minimum")
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message:
        "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    });

  private productWarranty = object({
    duration: number()
      .min(1 / 12, "Warranty can't be less than a month")
      .required("Warranty duration is required"),
    covered: string().required("Damages warranty covers is required"),
  });

  private productInfo = {
    name: string()
      .required("Product name is required")
      .min(10, "Product name should have more than 10 characters")
      .max(20, "Product name should not exceed 30 characters"),
    description: string()
      .required("Description is required")
      .min(15, "Description should have more than 15 characters")
      .max(40, "Description should not exceed 30 characters"),
    price: number()
      .min(0, "Price value is not allowed")
      .required("Product price is required"),
    images: array()
      .required("No image was uploaded")
      .min(2, "More than 1 image should be uploaded")
      .max(4, "Not more than 4 images should be uploaded")
      .of(mixed()),
    count: number().required("Product count in stock is required"),
    payment: array()
      .of(string().oneOf(Object.values(PAYMENTMETHOD), "Invalid payment type"))
      .min(1, "Payment method is required")
      .max(2, "Only two payment methods are allowed")
      .required("Payment method is required"),
    discount: number().nullable(),
    brand: string().required("Product brand is required"),
    colors: array()
      .of(string().required("Please provide color of product"))
      .min(1, "Please provide color of product")
      .max(4, "Not more than 4 colors should be added")
      .required("Please provide color of product"),
    mfgCountry: string().required("Production country is required"),
    mfgDate: string()
      .test("Date", "Date format should be in MM-YYYY", (val) => {
        const rg = /^\d{2}-\d{3}$/;
        return rg.test(val as string);
      })
      .required("Production date is required"),
    warranty: this.productWarranty,
  };

  public async signIn(data: any) {
    try {
      await object({
        email: this.email,
        pwd: this.pwd,
        fName: string()
          .min(2, "First Name should exceed 1 word")
          .max(20, "First Name should not exceed 20 words"),
        lName: string()
          .min(2, "Last Name should exceed 1 word")
          .max(20, "Last Name should not exceed 20 words"),
      }).validate(data);
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
    const maxSize = conts.files.imgSize;
    const { mimetype, createReadStream, filename } = await img;
    const rvBs64Type = (str: string) => str.replace(/^data:(.*,)?/, "");

    const types = conts.files.mimeType.supportedImg;
    if (!types.includes(mimetype)) {
      throw new GraphQLError(conts.errors.files.inCorrectImageFormat, {
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
        `${conts.errors.files.exceededMaxSize} ${(
          conts.files.imgSize / 1024
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
      throw new GraphQLError(conts.errors.files.duplicate, {
        extensions: { statusCode: 400 },
      });
    }
    return { filename, stream: createReadStream, b64 };
  }

  public async files(
    files: Promise<FileUpload>[],
    minNum = 1,
    maxNum = 1,
    prevFiles: string[] = []
  ) {
    if (files.length < minNum) {
      throw new GraphQLError(
        `${conts.errors.files.leastFileUpload} ${minNum}`,
        {
          extensions: { statusCode: 400 },
        }
      );
    }

    if (files.length > maxNum) {
      throw new GraphQLError(
        `${conts.errors.files.exceededMaxNumber} ${maxNum}`,
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
            throw new GraphQLError(conts.errors.server, {
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
        const valifationFunc = await this.image;
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
        const basePath = "uploads/img/";
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
      throw new GraphQLError(conts.errors.server, {
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
        .matches(/^[a-zA-Z0-9&'\s]*$/, "Special characters not allowed")
        .max(25, "Name should have not more than 25 characters"),
      description: string().max(
        110,
        "Description should have not more than 110 characters"
      ),
      image: mixed().nullable(),
      banners: array().nullable().of(mixed()),
      filters: array(
        object(
          isUpdate
            ? {
                id: string().nullable(),
                ...filterObj,
              }
            : filterObj
        )
      ).max(4, "Filters should not be more than 5"),
    };

    try {
      await object(
        isUpdate
          ? { id: string().required("Category ID not provided"), ...obj }
          : { ...obj, parent: string().nullable() }
      ).validate(val);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async categoryParent(name: string, parent: string) {
    try {
      await object({
        name: string().required("Category Name is required"),
        parent: string(),
      }).validate({ name, parent });
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async brand(data: any) {
    try {
      await object({
        name: string()
          .required("Name Field is empty")
          .min(2, "Name should have more than 2 characters")
          .matches(/^[a-zA-Z0-9'\s]*$/, "Special characters not allowed")
          .max(15, "Name should have not more than 15 characters"),
        image: mixed().required("No image was uploaded"),
      }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async valProductFilters(data: any) {
    try {
      this.productFilters.validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async valProduct(data: any) {
    try {
      await object({
        ...this.productInfo,
        cId: number().required("Product category is required"),
        warranty: this.productWarranty,
        filters: this.productFilters,
      }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async valProductInfo(data: any) {
    try {
      await object({
        ...this.productInfo,
        warranty: this.productWarranty,
      }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }
}

export const validator = new Validator();
