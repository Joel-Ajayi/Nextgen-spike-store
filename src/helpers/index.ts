import { Product } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ProductInput } from "../schema/types";
import consts from "../@types/conts";

export const verifyJWT = async (token: any, secret: any) => {
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

export const getSKU = (
  name: string,
  brand: string,
  price: number,
  colors: string[],
  catId: number
) => {
  const nameId = name.substring(0, 3);
  const cat = `C${catId}`;
  const priceId = `PR${Math.round(price / consts.sku.price)}`;
  const brandId = brand.substring(0, 3);
  const colourId = `${colors.map((c) => c.charAt(0)).join("")}`;
  return `${nameId}-${cat}-${brandId}-${priceId}-${colourId}`;
};
