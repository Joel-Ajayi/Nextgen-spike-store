import { max } from "lodash";
import { array, number, string } from "yup";
import { CatFilter, CatFilterValue } from "../types/category";

class ProductValidator {
  public async prdName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9'\s]*$/, "Special characters not allowed")
        .max(18, "Name should have not more than 18 characters")
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
        .max(200, "Description should have at most 200 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdDiscount(val = 0) {
    try {
      await number()
        .min(0, "Discount must be at least 0%")
        .max(100, "Discount cannot be more than 100%")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdPrice(val = 0) {
    try {
      await number()
        .min(1000, "Price cannot be less than ₦1000")
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
        .min(5, "You must have at least 5 of the product in stock")
        .max(500, "You must have at most 500 of the product in stock")
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

  public async prdPaymentMethods(val: string[] = []) {
    try {
      await array()
        .of(string())
        .min(1, "You must have at least 1 payment method")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdMfgDate(val: number) {
    const year = new Date().getFullYear();
    try {
      await number()
        .min(year - 15, `Year must be at least ${year - 15}`)
        .max(year, "Invalid year")
        .required("Invalid year")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdWarrantyDuration(val: number) {
    try {
      await number()
        .transform((value) => (Number.isNaN(value) ? null : value))
        .min(0.6, "Warranty must be at least 6months")
        .required("Warranty must be at least 6months")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async prdWarrantyCovered(val: string) {
    try {
      await string()
        .min(5, "Warranty covered must be at least 5 characters")
        .max(25, "Warranty covered must be at most 25 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }

  public async filterValue(val: number | string | null) {
    try {
      if (typeof val !== "number" || typeof val !== "string") {
        throw new Error("Filter value is required");
      }
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async filterValues(
    val: CatFilterValue[],
    requiredFilters: CatFilter[]
  ) {
    try {
      for (let index = 0; index < requiredFilters.length; index++) {
        const requiredFilter = requiredFilters[index];
        const isFound =
          val.findIndex((f) => f.optionId === requiredFilter.id) !== -1;

        if (!isFound) {
          throw new Error("A required filter has not been filled");
        }
      }
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }
}

const productValidator = new ProductValidator();
export default productValidator;
