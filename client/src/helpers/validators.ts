import { string, object } from "yup";

export const valSignInPwd = string()
  .required("Password is required")
  .min(8, "Password should be 8 chars minimum")
  .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
  });
export const valEmail = string()
  .required("Invalid email")
  .email("Invalid email");
