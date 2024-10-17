import { array, number, string } from "yup";
import { ProductFeature } from "../types/product";

class ProductValidator {
  public async prdName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(5, "Name should have more than 5 characters")
        .matches(/^[a-zA-Z0-9',()+".\s-]*$/, "Special characters not allowed")
        .max(100, "Name should have not more than 50 characters")
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
        .max(1300, "Description should have at most 1300 characters")
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
        .min(500, "Price value cannot be less than 500")
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
    const rg = /^(0[1-9]|1[0,1,2])-(20\d{2})$/;
    try {
      await string()
        .test({
          message: "Date format should be in MM-YYYY",
          test: (val) => rg.test(val as string) || !val,
        })
        .test({
          message: "Date cannot be more than current month",
          test: (date) => {
            if (!date) return true;
            const splitDate = (date as string).split("-");
            var currentDate = new Date();
            const inputDate = new Date(+splitDate[1], +splitDate[0]);
            return inputDate <= currentDate;
          },
        })
        .required("Date is required")
        .validate(val);
      return "";
    } catch (error) {
      if (!isRequired && (error as any).message === "Date is required")
        return "";
      return (error as any).message;
    }
  }

  public async warrDuration(val: number, isRequired: boolean) {
    try {
      await number()
        .min(1, "Warranty must be at least a month")
        .required("Warranty is required")
        .validate(val);
      return "";
    } catch (error) {
      if (!isRequired && (error as any).message === "Warranty is required")
        return "";
      return (error as any).message;
    }
  }

  public async warrCovered(val: string, isRequired: boolean) {
    try {
      if (isRequired && !val) return "Warranty Covered is required";

      await string()
        .max(150, "Warranty covered must be at most 150 characters")
        .required("Warranty covered is required")
        .validate(val);
      return "";
    } catch (error) {
      if (
        !isRequired &&
        (error as any).message === "Warranty covered is required"
      )
        return "";
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
