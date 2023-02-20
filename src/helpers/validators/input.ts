import { GraphQLError } from "graphql";
import { object, string } from "yup";

const pwd = string()
  .required("Password is required")
  .min(8, "Password should be 8 chars minimum")
  .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
    message:
      "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
  });

const email = string().email("invalid email");

const fullName = string()
  .min(2, "Name is 2 chars minimum")
  .max(50, "Name should not exceed 50 characters")
  .required("last name is required");

const signupArgs = object({
  email,
  pwd,
});

const sellerSignUpArgs = object({
  email,
  pwd,
});

const loginArgs = object({ email, pwd });

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
