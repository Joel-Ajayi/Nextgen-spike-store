import { string, array } from "yup";
import { CategoryFeature } from "../types/category";

class CategoryValidator {
  public async catName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9&'\s]*$/, "Special characters not allowed")
        .max(25, "Name should have not more than 25 characters")
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

  public async catFeatureName(val: string, names: string[]) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .max(20, "Name should have not more than 20 characters")
        .validate(val);

      if (names.includes(val)) return "Name must be unique";
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFeatureOptions(val: string[]) {
    try {
      await array()
        .of(string().max(10, "Option should have not more than 10 characters"))
        .max(10, "Options should not be more than 10")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }
}

const categoryValidator = new CategoryValidator();
export default categoryValidator;
