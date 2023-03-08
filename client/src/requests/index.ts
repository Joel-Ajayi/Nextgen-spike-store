import axios from "axios";
import { CONSTS } from "../const";

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
      throw new Error(res.data.errors[0].message);
    }
    return res.data?.data;
  } catch (err) {
    if (errFromServer) throw new Error((err as any)?.message);

    if (
      (err as any)?.code === CONSTS.errors.code.network ||
      (err as any)?.code === CONSTS.errors.code.badResponse
    ) {
      throw new Error(CONSTS.errors.badResponse);
    }
    throw new Error(CONSTS.errors.errorOccured);
  }
};
