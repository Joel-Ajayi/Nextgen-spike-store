import jwt from "jsonwebtoken";
import consts from "../@types/conts";
import { db } from "../db/prisma/connect";
import { CategoryOfferType } from "../@types/categories";
import { GraphQLError } from "graphql";
import colours from "../db/colours";
import { Types } from "mongoose";

class Helpers {
  public verifyJWT = async (token: any, secret: any) => {
    const decoded: string | jwt.JwtPayload | undefined = await new Promise(
      (resolve) => {
        jwt.verify(token as string, secret as string, (err, val) => {
          if (!err) {
            resolve(undefined);
          } else {
            resolve(val);
          }
        });
      }
    );

    return decoded;
  };

  public getValidId = (id: string) => {
    const ObjectId = Types.ObjectId;
    const isValidId = ObjectId.isValid(id) && String(new ObjectId(id)) === id;
    return isValidId ? id : new ObjectId().toString();
  };

  public getObjKeys = <T>(enumObj: Object) =>
    Object.values(enumObj).filter((_, i, arr) => i < arr.length / 2) as T[];

  public valIndexInObj = (
    enumObj: Object,
    index: number,
    errorSuffix: string
  ) => {
    const includesIndex = this.getObjIndexes<number>(enumObj).includes(index);
    if (!includesIndex) {
      throw new GraphQLError(`Invalid  ${errorSuffix}`, {
        extensions: { statusCode: 500 },
      });
    }
  };

  public getObjIndexes = <T>(enumObj: Object) =>
    Object.values(enumObj).filter((_, i, arr) => i >= arr.length / 2) as T[];

  public getSKU = (
    name: string,
    brand: string,
    price: number,
    colors: string[],
    catId: number
  ) => {
    const nameId = name.substring(0, 3);
    const cat = `C${catId}`;
    const priceId = `PR${Math.round(price / consts.product.sku.price)}`;
    const brandId = brand.substring(0, 3);
    const colourId = `${colors.map((c) => c.charAt(0)).join("")}`;
    return `${nameId}-${cat}-${brandId}-${priceId}-${colourId}`;
  };

  public getParentandChildNames = async (
    parentCats: string[],
    offers: string[] = []
  ) => {
    const categories: string[] = [];

    const offerTypes = helpers.getObjIndexes<string>(CategoryOfferType);
    const isOfferNotFound = !offers.every((o) => offerTypes.includes(o));
    if (isOfferNotFound) {
      throw new GraphQLError("Offer Not Found", {
        extensions: { statusCode: 404 },
      });
    }

    const offerIndexes = offers.map((_, i) => i);
    await (async function findChildren(
      children: string[],
      parentHasOffer = false
    ) {
      await Promise.all(
        children.map(async (name) => {
          const category = await db.category.findFirst({
            where: { name },
            select: {
              id: true,
              name: true,
              children: { select: { name: true } },
              offers: { select: { type: true } },
            },
          });

          if (!category) {
            throw new GraphQLError("Category Not Found", {
              extensions: { statusCode: 404 },
            });
          }

          const checkOffers = !!offerIndexes.length;
          const hasOffer =
            !checkOffers ||
            category?.offers.findIndex((o) => offerIndexes.includes(o.type)) !==
              0;

          if (hasOffer || (!hasOffer && parentHasOffer)) {
            categories.push(category.name);

            if (category?.children.length) {
              await findChildren(
                category.children.map((c) => c.name),
                hasOffer
              );
            }
          }
        })
      );
    })(parentCats);
    return categories;
  };

  private hexToRgb = (hex: string) => {
    hex = hex.replace("#", "");

    // Convert the red, green, and blue components from hex to decimal
    // you can substring instead of slice as well
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Return the RGB value as an object with properties r, g, and b
    return { r, g, b };
  };

  private colourDistance = (
    rgb1: { r: number; g: number; b: number },
    hex2: string
  ) => {
    const rgb2 = this.hexToRgb(hex2);

    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  public getCloseClolour = (hex: string) => {
    let minDistance = Infinity;
    let closeColour = "";
    const rgb1 = this.hexToRgb(hex);
    for (const colour of colours) {
      const distance = this.colourDistance(rgb1, colour[1]);
      if (distance < minDistance) {
        closeColour = colour[1];
        minDistance = distance;
      }
    }
    return closeColour;
  };

  public paginate = (count: number, take: number, skip: number) => {
    const page = Math.ceil((skip + take) / take);
    const numPages = Math.ceil(count / take);
    return { skip, page, numPages, take, count };
  };
}

const helpers = new Helpers();
export default helpers;
