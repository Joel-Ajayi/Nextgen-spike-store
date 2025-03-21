import { string, array, number, object, Schema } from "yup";
import {
  CategoryBanner,
  CategoryFeature,
  CategoryOffer,
} from "../types/category";
import validator from ".";
import { IFile } from "../types";

class CategoryValidator {
  public async catName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9&(),'\s]*$/, "Special characters not allowed")
        .max(50, "Name should have not more than 25 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async catDesc(val: string) {
    try {
      await string()
        .max(110, "Description should have not more than 110 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async banner(val: CategoryBanner, key = "") {
    const obj: { [key in string]: Schema } = {
      tagline: string()
        .max(100, "Tagline should not be more than 100 words")
        .required("Offer tagline is required"),
    };

    try {
      if (val) {
        const files = !val?.image ? [] : [(val.image as IFile)?.file];

        if (!key) {
          await object(obj).validate(val);
          const error = await validator.files(files, "image", 1);
          return error;
        } else {
          if (key === "image") {
            const error = await validator.files(files, "image", 1);
            return error;
          } else {
            await obj[key]?.validate(val[key as keyof CategoryBanner]);
          }
        }
      }
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async features(val: CategoryFeature[]) {
    try {
      await array(
        object({
          name: string()
            .required("Name Field is empty")
            .min(2, "Name should have more than 2 characters")
            .max(20, "Name should have not more than 20 characters"),
          options: array()
            .of(
              string().max(10, "Option should have not more than 10 characters")
            )
            .max(10, "Options should not be more than 10"),
        })
      ).validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async offers(val: CategoryOffer[], length: number, key = "") {
    const obj: { [key in string]: Schema } = {
      tagline: string()
        .max(100, "Tagline should not be more than 100 words")
        .required("Offer tagline is required"),
      type: number().required("Please provide filter type"),
      audience: number(),
      discount: number()
        .max(100, "Discount cannot be more than 100%")
        .min(1, "Discount should be more than 0%")
        .required("Disocunt is required"),
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
    };

    try {
      if (!key) {
        await array(object(obj))
          .test({
            message: "Unique offer type is required",
            test: (list) =>
              list
                ? list?.length === new Set(list.map((item) => item.type)).size
                : true,
          })
          .max(length, `Offers cannot be more than ${length}`)
          .validate(val);
        await Promise.all(
          val.map(async ({ image }) => {
            const files = !image ? [] : [(image as IFile)?.file];
            const error = await validator.files(files, "image", 1);
            if (error) throw new Error(error);
          })
        );
      } else {
        if (key === "image") {
          const files = val[0]?.image ? [(val[0].image as IFile)?.file] : [];
          const error = await validator.files(files, "image", 1);
          return error;
        } else {
          await obj[key]?.validate(val[0][key as keyof CategoryOffer]);
        }
      }

      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }
}

const categoryValidator = new CategoryValidator();
export default categoryValidator;
