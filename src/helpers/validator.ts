import { GraphQLError } from "graphql";
import { string, object, array, boolean, mixed, number } from "yup";
import {
  CategoryFeatureType,
  CategoryOfferType as CategoryOfferType,
  Category_I,
  Category_I_U,
} from "../@types/categories";
import { PaymentType, Product_I } from "../@types/products";
import helpers from ".";
class Validator {
  private productFeatures = array(
    object({
      id: string(),
      featureId: string().required("Feature id is required"),
      value: string().required("Feature value is required"),
    })
  );

  private email = string().required("Invalid email").email("Invalid email");

  private pwd = string()
    .required("Password is required")
    .min(8, "Password should be 8 chars minimum")
    .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
      message:
        "password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    });

  private productInfo = {
    brand: string().required("Product brand is required"),
    cId: number().required("Product category is required"),
    features: this.productFeatures,
    name: string()
      .required("Product name is required")
      .min(5, "Product name should have more than 5 characters")
      .max(50, "Product name should not exceed 50 characters"),
    description: string()
      .required("Description is required")
      .min(50, "Description should have at least 50 characters")
      .max(700, "Description should have at most 700 characters"),
    price: number()
      .min(0.1, "Price value cannot be less than 100")
      .max(500000, "Price cannot be more than 500,000")
      .required("Product price is required"),
    images: array()
      .required("No image was uploaded")
      .min(2, "More than 1 image should be uploaded")
      .max(4, "Not more than 4 images should be uploaded")
      .of(mixed()),
    count: number()
      .min(2, "You must have at least 2 of the product in stock")
      .required("Product count in stock is required"),
    paymentType: number()
      .oneOf(helpers.getObjValues<number>(PaymentType), "Invalid payment type")
      .required("Payment method is required"),
    discount: number(),
    colours: array()
      .of(string().required("Please provide color of product"))
      .min(1, "Please provide color of product")
      .max(4, "Not more than 4 colors should be added")
      .required("Please provide color of product"),
    mfgDate: string()
      .test({
        message: "Date format should be in MM-YYYY",
        test: (val) =>
          /^(0[1-9]|1[0,1,2])-(20\d{2})$/.test(val as string) || !val,
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
      }),
    warrDuration: number(),
    warrCovered: string(),
  };

  public async signIn(data: any) {
    try {
      await object({
        email: this.email,
        pwd: this.pwd,
        fName: string()
          .min(2, "First Name should exceed 1 word")
          .max(20, "First Name should not exceed 20 words"),
        lName: string()
          .min(2, "Last Name should exceed 1 word")
          .max(20, "Last Name should not exceed 20 words"),
      }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: {
          statusCode: 400,
        },
      });
    }
  }

  public async category(val: Category_I | Category_I_U, isUpdate = false) {
    const offersIndexes = helpers.getObjValues<number>(CategoryOfferType);
    const obj = {
      name: string()
        .required("Name Field is empty")
        .min(2, "Name should have more than 2 characters")
        .matches(/^[a-zA-Z0-9&(),'\s]*$/, "Special characters not allowed")
        .max(50, "Name should have not more than 50 characters"),
      description: string().max(
        110,
        "Description should have not more than 110 characters"
      ),
      parent: string().nullable(),
      features: array(
        object({
          name: string()
            .required("Name Field is empty")
            .min(2, "Name should have more than 2 characters")
            .max(20, "Name should have not more than 20 characters"),
          useAsFilter: boolean().required("Required field is not provided"),
          type: mixed()
            .oneOf(
              Object.values(CategoryFeatureType),
              "Please provide valid filter type"
            )
            .required("Please provide filter type"),
          options: array()
            .of(
              string().max(10, "Option should have not more than 10 characters")
            )
            .nullable()
            .max(10, "Options should not be more than 10"),
        })
      ),
      banner: object({
        tagline: string()
          .max(100, "Tagline should not be more than 100 words")
          .required("Offer tagline is required"),
        bannerColours: array(
          string().test({
            message: "Invalid Colour",
            test: (val) => /^#[0-9A-Za-z]{6}$/.test(val as string),
          })
        )
          .max(3, "Banner colour should not be more than 3")
          .required("Banner colour required"),
      }).nullable(),
      offers: array(
        object({
          tagline: string()
            .max(100, "Tagline should not be more than 100 words")
            .required("Offer tagline is required"),
          type: number()
            .oneOf(offersIndexes, "Please provide valid filter type")
            .required("Please provide filter type"),
          discount: number()
            .max(100, "Discount cannot be more than 100%")
            .min(1, "Discount should be more than 0%")
            .required("Disocunt is required"),
          bannerColours: array(
            string().test({
              message: "Invalid Colour",
              test: (val) => /^#[0-9A-Za-z]{6}$/.test(val as string),
            })
          )
            .max(3, "Colours should not be more than 3")
            .required("Offer Banner colour required"),
          validUntil: string()
            .required("Max Date of offer is required")
            .test({
              message: "Date format should be in DD-MM-YYYY",
              test: (val) =>
                /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(20\d{2})$/.test(
                  val as string
                ),
            })
            .test({
              message: "Max Offer Date cannot be less than Today",
              test: (date) => {
                const splitDate = (date as string).split("-");
                var currentDate = new Date();
                const inputDate = new Date(
                  `${splitDate[2]}-${splitDate[1]}-${+splitDate[0] + 1}`
                );
                return inputDate >= currentDate;
              },
            }),
        })
      )
        .max(
          offersIndexes.length,
          `offers cannot be more than ${offersIndexes.length}`
        )
        .test({
          message: "Unique offer type is required",
          test: (list) =>
            list
              ? list?.length === new Set(list.map((item) => item.type)).size
              : true,
        }),
    };

    try {
      await object(obj).validate(val);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async categoryParent(name: string, parent: string) {
    try {
      await object({
        name: string().required("Category Name is required"),
        parent: string(),
      }).validate({ name, parent });
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async brand(data: any) {
    try {
      await object({
        name: string()
          .required("Name Field is empty")
          .min(2, "Name should have more than 2 characters")
          .matches(/^[a-zA-Z0-9'\s]*$/, "Special characters not allowed")
          .max(15, "Name should have not more than 15 characters"),
        image: mixed().required("No image was uploaded"),
      }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async valProductFeatures(data: any) {
    try {
      this.productFeatures.validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }

  public async valProduct(data: Product_I) {
    try {
      await object({ ...this.productInfo }).validate(data);
    } catch (error) {
      throw new GraphQLError((error as any).message, {
        extensions: { statusCode: 400 },
      });
    }
  }
}

export const validator = new Validator();
