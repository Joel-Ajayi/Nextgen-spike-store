import { object, string, number, date } from "yup";

const password = string()
  .required("Password is required")
  .min(8, "Password should be 8 chars minimum")
  .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
  });

const email = string().email("invalid email");

const fName = string()
  .min(2, "first name is 2 chars minimum")
  .required("first name is required");

const usertype = string()
  .matches(/USER | ADMIN/, { message: "type must be USER or ADMIN" })
  .required("signup type is required");

const lName = string()
  .min(2, "last name is 2 chars minimum")
  .required("last name is required");

const age = number().max(120).min(10);

export const loginArgs = object().shape({ email, password });

export const signupArgs = object().shape({
  email,
  password,
  lname: lName,
  fname: fName,
});
