import axios from "axios";
import { CONSTS } from "../const";
import filesHelper from "../helpers/files";
import { IFile, IMessage, MessageType } from "../types";

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

class Requests {
  public async getImageFiles(paths: string[]) {
    const files = await Promise.all(
      paths.map(async (path) => {
        const response = await axios.get(path, {
          responseType: "blob",
        });
        const mimeType = response.headers["content-type"];
        const fileName = path.split("/").pop() as string;
        const file = new File([response.data], fileName, { type: mimeType });
        const b64 = await filesHelper.getBase64String(file);
        return { file, b64 } as IFile;
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
      return { res: Object.values(resData)[0] as T, msg: null };
    } catch (err) {
      console.log(err);
      let msg: IMessage | null = null;
      if (errFromServer) {
        msg = {
          msg: (err as any)?.message,
          type: MessageType.Error,
          statusCode: (err as any)?.statusCode,
        } as IMessage;
      }

      if (
        (err as any)?.code === CONSTS.errors.code.network ||
        (err as any)?.code === CONSTS.errors.code.badResponse
      ) {
        msg = {
          msg: CONSTS.errors.badResponse,
          type: MessageType.Error,
          statusCode: 500,
        } as IMessage;
      }

      if (!msg) {
        msg = {
          msg: CONSTS.errors.errorOccured,
          type: MessageType.Error,
          statusCode: 500,
        } as IMessage;
      }

      return { msg, res: null };
    }
  }
}

const request = new Requests();
export default request;
