import { string, array } from "yup";
import { CatFilter } from "../types/category";

class CategoryValidator {
  public async catName(val: string) {
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

  public async catFilter(val: CatFilter[]) {
    try {
      await array().max(5, "Filters should not be more than 5").validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFilterName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .max(10, "Name should have not more than 10 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFilterUnit(val: string) {
    try {
      await string()
        .max(5, "Unit should have not more than 5 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message as string;
    }
  }

  public async catFilterOptions(val: string[]) {
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
