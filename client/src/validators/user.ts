import { StringSchema, string } from "yup";
import { SignInFieds } from "../types/user";

class UserValidator {
  private email() {
    return string().required("Invalid email").email("Invalid email");
  }

  public pwd() {
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

  public async signIn(field: SignInFieds, data: any) {
    try {
      const fields: { [key in SignInFieds]: StringSchema<any> } = {
        email: this.email(),
        pwd: this.pwd(),
        fName: string()
          .min(2, "First Name should exceed 1 word")
          .max(20, "First Name should not exceed 20 words"),
        lName: string()
          .min(2, "Last Name should exceed 1 word")
          .max(20, "Last Name should not exceed 20 words"),
      };

      await fields[field].validate(data);
      return { error: "" };
    } catch (error) {
      return { error: (error as any).message };
    }
  }

  public async address(name: string, value: any) {
    try {
      switch (name) {
        case "name":
          await string()
            .required("Name Field is empty")
            .min(2, "Name should have more than 1 characters")
            .matches(/^[a-zA-Z0-9'\s]*$/, "Special characters not allowed")
            .max(20, "Name should have not more than 20 characters")
            .validate(value);
          break;
        case "address":
          await string()
            .max(100, "Address should not be more than 100 chars")
            .required("Address is required")
            .validate(value);
          break;
        case "tel":
          await string()
            .test({
              message: "Invalid Phone Number",
              test: (val) => /^\d{4}\s\d{3}\s\d{4}$/.test(val as string),
            })
            .required("Input Phone Number")
            .validate(value);
          break;
        default:
          break;
      }
      return "";
    } catch (error) {
      return (error as any).message;
    }
  }
}

const userValidator = new UserValidator();
export default userValidator;
