import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { GraphQLError } from "graphql";
import { FileUpload } from "graphql-upload/Upload";
import { Stream } from "stream";
import { string, object, array, boolean, mixed, number, addMethod } from "yup";
import {
  CategoryFeatureType,
  CategoryForm,
  CategoryOfferType as CategoryOfferType,
} from "../@types/categories";
import conts from "../@types/conts";
import { PaymentType, Product_I } from "../@types/products";
import { getObjValues } from ".";

class Validator {
  private productFeatures = array(
    object({
      id: string(),
      featureId: string().required("Feature id is required"),
      value: string().required("Feature value is required"),
    })
  );

  private email = string().required("Invalid email").email("Invalid email");

  private pwd = string()
    .required("Password is required")
    .min(8, "Password should be 8 chars minimum")
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message:
        "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    });

  private productInfo = {
    brand: string().required("Product brand is required"),
    cId: number().required("Product category is required"),
    features: this.productFeatures,
    name: string()
      .required("Product name is required")
      .min(5, "Product name should have more than 5 characters")
      .max(50, "Product name should not exceed 50 characters"),
    description: string()
      .required("Description is required")
      .min(50, "Description should have at least 50 characters")
      .max(200, "Description should have at most 200 characters"),
    price: number()
      .min(0.1, "Price value cannot be less than 100")
      .max(500000, "Price cannot be more than 500,000")
      .required("Product price is required"),
    images: array()
      .required("No image was uploaded")
      .min(2, "More than 1 image should be uploaded")
      .max(4, "Not more than 4 images should be uploaded")
      .of(mixed()),
    count: number()
      .min(2, "You must have at least 2 of the product in stock")
      .required("Product count in stock is required"),
    paymentType: number()
      .oneOf(getObjValues<number>(PaymentType), "Invalid payment type")
      .required("Payment method is required"),
    discount: number(),
    colours: array()
      .of(string().required("Please provide color of product"))
      .min(1, "Please provide color of product")
      .max(4, "Not more than 4 colors should be added")
      .required("Please provide color of product"),
    mfgDate: string()
      .test({
        message: "Date format should be in MM-YYYY",
        test: (val) => /^(0[1-9]|1[0,1,2])-(20\d{2})$/.test(val as string),
      })
      .test({
        message: "Date cannot be more than current month",
        test: (date) => {
          const splitDate = (date as string).split("-");
          var currentDate = new Date();
          const inputDate = new Date(+splitDate[1], +splitDate[0]);
          return inputDate <= currentDate;
        },
      }),
    warrDuration: number().min(1, "Warranty can't be less than a month"),
    warrCovered: string(),
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
      throw new Error(conts.errors.files.inCorrectImageFormat);
    }

    const chunks: any = [];
    const stream = createReadStream();
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const b64 = rvBs64Type(buffer.toString("base64"));
    if (buffer.byteLength > maxSize) {
      throw new Error(
        `${conts.errors.files.exceededMaxSize} ${(
          conts.files.imgSize / 1024
        ).toFixed(0)}kb`
      );
    }

    const duplicateFilePath = prevUploadedB64s.find(
      (upload) => upload.b64 === b64
    );
    if (!!duplicateFilePath) return duplicateFilePath;

    if (b64s.includes(b64)) {
      throw new Error(conts.errors.files.duplicate);
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

        try {
          const comparableB64s = b64s.map(({ b64 }) => b64 || "");
          const valifationFunc = await this.image;
          const b64 = await valifationFunc(file, comparableB64s, prevB64s);
          if ((b64 as any)?.filePath) {
            prevB64s = prevB64s.filter((prev) => prev.b64 !== b64.b64);
          }
          if (!!b64) b64s.push(b64);
        } catch (error) {
          // delete saved files before throwing error
          await this.deleteFiles(
            b64s.map(({ filePath }) => filePath as string)
          );

          // throw error
          throw new GraphQLError((error as any).message, {
            extensions: { statusCode: 400 },
          });
        }
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
    const offersIndexes = getObjValues<number>(CategoryOfferType);
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
      features: array(
        object({
          name: string()
            .required("Name Field is empty")
            .min(2, "Name should have more than 2 characters")
            .max(20, "Name should have not more than 20 characters"),
          useAsFilter: boolean().required("Required field is not provided"),
          type: mixed()
            .oneOf(
              Object.values(CategoryFeatureType),
              "Please provide valid filter type"
            )
            .required("Please provide filter type"),
          options: array()
            .of(
              string().max(10, "Option should have not more than 10 characters")
            )
            .nullable()
            .max(10, "Options should not be more than 10"),
        })
      ),
      offers: array(
        object({
          type: number()
            .oneOf(offersIndexes, "Please provide valid filter type")
            .required("Please provide filter type"),
          discount: number()
            .max(100, "Discount cannot be more than 100%")
            .min(1, "Discount should be more than 0%")
            .required("Disocunt is required"),
          banner: mixed().required("Offer banner is required"),
          validUntil: string()
            .required("Max Date of offer is required")
            .test({
              message: "Date format should be in DD-MM-YYYY",
              test: (val) =>
                /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(20\d{2})$/.test(
                  val as string
                ),
            })
            .test({
              message: "Max Offer Date cannot be less than Today",
              test: (date) => {
                const splitDate = (date as string).split("-");
                var currentDate = new Date();
                const inputDate = new Date(
                  `${splitDate[2]}-${splitDate[1]}-${+splitDate[0] + 1}`
                );
                return inputDate >= currentDate;
              },
            }),
        })
      )
        .max(
          offersIndexes.length,
          `offers cannot be more than ${offersIndexes.length}`
        )
        .test({
          message: "Unique offer type is required",
          test: (list) =>
            list
              ? list?.length === new Set(list.map((item) => item.type)).size
              : true,
        }),
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

  public async valProductFeatures(data: any) {
    try {
      this.productFeatures.validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async valProduct(data: Product_I) {
    try {
      await object({ ...this.productInfo }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }
}

export const validator = new Validator();
