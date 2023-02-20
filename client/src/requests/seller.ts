import axios, { AxiosRequestConfig } from "axios";
import { CONSTS } from "../const";
import { IError, ISellerInitailState } from "../types";

const config: AxiosRequestConfig<string> = {
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
  url: "/api/seller",
};

export const getSeller = async (): Promise<
  ISellerInitailState | null | IError
> => {
  try {
    const res = (await axios.post(
      JSON.stringify({
        query: `query Seller { SellerQuery { contactNumber avater email fName id lName username role}}`,
      }),
      config
    )) as any;
    if (!res.SellerQuery) throw new Error();
    return res.SellerQuery;
  } catch (err) {
    if (
      (err as any)?.code === CONSTS.errors.code.network ||
      (err as any)?.code === CONSTS.errors.code.badResponse
    ) {
      return { code: (err as any)?.code, message: (err as any)?.message };
    }
    return null;
  }
};
