import axios from "axios";
import { CONSTS } from "../const";

interface ApiErrorOptions extends ErrorOptions {
  statusCode: number;
}

export class ApiError extends Error {
  public statusCode: number;
  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options?.cause });
    this.statusCode = options?.statusCode;
  }
}

export const makeRequest = async (
  data: string | FormData,
  isUpload = false
) => {
  const headers: { [key in string]: string } = {};
  if (isUpload) {
    headers["Apollo-Require-Preflight"] = "true";
  } else {
    headers["Content-Type"] = "application/json";
  }

  let errFromServer = false;
  try {
    const res = await axios.post("/api", data, { headers });
    if (res.data?.errors?.length) {
      errFromServer = true;
      throw new ApiError(res.data.errors[0].message, {
        statusCode: res.data.errors[0].statusCode,
      });
    }
    return res.data?.data;
  } catch (err) {
    console.log(err);
    if (errFromServer) {
      throw new ApiError((err as any)?.message, {
        statusCode: (err as any)?.statusCode,
      });
    }

    if (
      (err as any)?.code === CONSTS.errors.code.network ||
      (err as any)?.code === CONSTS.errors.code.badResponse
    ) {
      throw new ApiError(CONSTS.errors.badResponse, {
        statusCode: 500,
      });
    }
    throw new ApiError(CONSTS.errors.errorOccured, {
      statusCode: 500,
    });
  }
};
