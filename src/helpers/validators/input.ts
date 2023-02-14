import { GraphQLError } from "graphql";
import { object, string } from "yup";

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

const lName = string()
  .min(2, "last name is 2 chars minimum")
  .required("last name is required");

const signupArgs = object().shape({
  email,
  password,
  lName,
  fName,
});

const sellerSignUpArgs = object().shape({
  email,
  password,
  lName,
  fName,
});

const loginArgs = object().shape({ email, password });

export const validateLogin = async (data: any) => {
  try {
    await loginArgs.validate(data);
  } catch (error) {
    throw new GraphQLError((error as any).message, {
      extensions: {
        statusCode: 400,
      },
    });
  }
};

export const validateSignUp = async (data: any) => {
  try {
    await signupArgs.validate(data);
  } catch (error) {
    throw new GraphQLError((error as any).message, {
      extensions: {
        statusCode: 400,
      },
    });
  }
};

export const validateSellerSignUp = async (data: any) => {
  try {
    await sellerSignUpArgs.validate(data);
  } catch (error) {
    throw new GraphQLError((error as any).message, {
      extensions: {
        statusCode: 400,
      },
    });
  }
};
