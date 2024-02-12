import { max } from "lodash";
import { array, number, string } from "yup";
import { CategoryFeature } from "../types/category";
import { ProductFeature } from "../types/product";

class ProductValidator {
  public async prdName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(5, "Name should have more than 5 characters")
        .matches(/^[a-zA-Z0-9'\s]*$/, "Special characters not allowed")
        .max(50, "Name should have not more than 50 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdDesc(val: string) {
    try {
      await string()
        .min(50, "Description should have at least 50 characters")
        .max(700, "Description should have at most 700 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdDiscount(val = 0) {
    try {
      await number().min(0, "Discount must be at least 0%").validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdPrice(val = 0) {
    try {
      await number()
        .min(0.1, "Price value cannot be less than 100")
        .max(500000, "Price cannot be more than 500,000")
        .required("Price is Required")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdCount(val = 0) {
    try {
      await number()
        .min(2, "You must have at least 2 of the product in stock")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdColours(val: string[] = []) {
    try {
      await array()
        .of(string())
        .min(1, "You must have at least 1 colour of the product in stock")
        .max(10, "You must have at most 10 colours of the product in stock")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdPaymentType(val: number) {
    try {
      await number().validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdMfgDate(val: string, isRequired: boolean) {
    const rg = /^(\d{2})-(\d{4})$/;
    try {
      await string()
        .test({
          message: "Date format should be in MM-YYYY",
          test: (val) => rg.test(val as string),
        })
        .test({
          message: "Date cannot be more than current month",
          test: (date) => {
            var currentDate = new Date();
            const matches = (date || "").split("-");
            return !(
              Number(matches[1]) > currentDate.getFullYear() ||
              (Number(matches[1]) === currentDate.getFullYear() &&
                Number(matches[0]) > currentDate.getMonth())
            );
          },
        })
        .required("Date is required")
        .validate(val);
      return "";
    } catch (error) {
      if (!isRequired) return "";
      return (error as any).message;
    }
  }

  public async warrDuration(val: number, isRequired: boolean) {
    try {
      await number()
        .min(1, "Warranty must be at least a month")
        .required("Warranty must be at least a month")
        .validate(val);
      return "";
    } catch (error) {
      if (!isRequired) return "";
      return (error as any).message;
    }
  }

  public async warrCovered(val: string, isRequired: boolean) {
    try {
      if (isRequired && !val) return "Warranty Covered is required";

      await string()
        .min(5, "Warranty covered must be at least 5 characters")
        .max(150, "Warranty covered must be at most 150 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public productFeature(val: string) {
    if (!val && typeof val !== "number") return "Feature value is required";
    return "";
  }

  public async productFeatures(productFeatures: ProductFeature[]) {
    try {
      const isFieldEmpty =
        productFeatures.findIndex(
          (f) => !f.value && typeof f.value !== "number"
        ) !== -1;

      if (isFieldEmpty) {
        throw new Error("A required filter has not been filled");
      }
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }
}

const productValidator = new ProductValidator();
export default productValidator;
