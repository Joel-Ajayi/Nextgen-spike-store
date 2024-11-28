import axios from "axios";
import { CONSTS } from "../const";
import { IMessage, MessageType, StatusCodes } from "../types";
import { dispatch } from "../store";
import appSlice from "../store/appState";
interface ApiErrorOptions extends ErrorOptions {
  statusCode: number;
  code: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options?.cause });
    this.statusCode = options.statusCode;
    this.code = options.code;
  }
}

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

  public async makeRequest<T>(
    data: string | FormData,
    isUpload = false,
    showMsg = true
  ) {
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
          statusCode: res.data.errors[0].extensions.statusCode,
          code: res.data.errors[0].extensions.code,
        });
      }

      const resData = Object.values(res.data?.data as Object)[0] as T;

      dispatch(appSlice.actions.setStatusCode(StatusCodes.Ok));

      if ((resData as any)?.message) {
        dispatch(
          appSlice.actions.setBackgroundMsg({
            msg: (resData as any)?.message,
            type: MessageType.Success,
            statusCode: StatusCodes.Ok,
          })
        );
      }

      return resData;
    } catch (error) {
      const err = error as ApiError;
      console.log((error as any)?.response?.request?.responseText);

      dispatch(appSlice.actions.setStatusCode(err.statusCode));

      if (showMsg) {
        let msg: IMessage | null = null;
        if (errFromServer) {
          msg = {
            msg: err.message,
            type: MessageType.Error,
            statusCode: err.statusCode,
          } as IMessage;
        } else if (
          err.code === CONSTS.errors.code.network ||
          err.code === CONSTS.errors.code.badResponse
        ) {
          msg = {
            msg: CONSTS.errors.badResponse,
            type: MessageType.Error,
            statusCode: StatusCodes.ServerError,
          } as IMessage;
        } else {
          msg = {
            msg: CONSTS.errors.errorOccured,
            type: MessageType.Error,
            statusCode: StatusCodes.ServerError,
          } as IMessage;
        }
        dispatch(appSlice.actions.setBackgroundMsg(msg));
      }

      return null as T;
    }
  }
}

const request = new Requests();
export default request;
