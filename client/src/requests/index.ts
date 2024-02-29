import axios from "axios";
import { CONSTS } from "../const";
import {
  IMessage,
  MessageType,
  RedirectStatusCodes,
  StatusCodes,
} from "../types";
import { dispatch } from "../store";
import appSlice from "../store/appState";
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

export type ThrownError = {
  statusCode: StatusCodes;
  message: string;
  code: string;
};

class Requests {
  public async getImageFiles(paths: string[]) {
    const files = await Promise.all(
      paths.map(async (src) => {
        const response = await axios.get(`/uploads/${src}`, {
          responseType: "blob",
        });
        const mimeType = response.headers["content-type"];
        const fileName = src.split("/").pop() as string;
        const file = new File([response.data], fileName, { type: mimeType });
        const baseUrl = `/uploads/`;
        return { file, src, baseUrl };
      })
    );
    return files;
  }

  public async makeRequest<T>(data: string | FormData, isUpload = false) {
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

      const resData = res.data?.data as Object;
      return Object.values(resData)[0] as T;
    } catch (error) {
      const err = error as ThrownError;
      let msg: IMessage | null = null;
      console.log(err);
      //
      dispatch(appSlice.actions.setStatusCode(err.statusCode));

      if (errFromServer) {
        msg = {
          msg: err.message,
          type: MessageType.Error,
          statusCode: err.statusCode,
        } as IMessage;
      }

      if (
        err.code === CONSTS.errors.code.network ||
        err.code === CONSTS.errors.code.badResponse
      ) {
        msg = {
          msg: CONSTS.errors.badResponse,
          type: MessageType.Error,
          statusCode: StatusCodes.ServerError,
        } as IMessage;
      }

      if (!msg) {
        msg = {
          msg: CONSTS.errors.errorOccured,
          type: MessageType.Error,
          statusCode: StatusCodes.ServerError,
        } as IMessage;
      }

      dispatch(appSlice.actions.setBackgroundMsg(msg));
      return null;
    }
  }
}

const request = new Requests();
export default request;
