import { string } from "yup";

class BrandValidator {
  public async brdName(val: string) {
    try {
      await string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9'\s]*$/, "Special characters not allowed")
        .max(15, "Name should have not more than 15 characters")
        .validate(val);
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }
}

const brandValidator = new BrandValidator();
export default brandValidator;
