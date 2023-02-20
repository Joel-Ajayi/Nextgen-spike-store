import axios, { AxiosRequestConfig } from "axios";
import { CONSTS } from "../const";
import { IUserInitailState, IError, IMessage, MessageType } from "../types";
import { SignInFieds, SignInForm } from "../types/user";

const url = "/api/app";
const config: AxiosRequestConfig<string> = {
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
};

export const getUser = async (): Promise<IUserInitailState | null | IError> => {
  try {
    const body = JSON.stringify({
      query: `query { UserQuery { contactNumber avater email fullName id }}`,
    });
    const res = (await axios.post(url, body, config)).data as any;
    if (!res.data.UserQuery) throw new Error();
    return res.data.UserQuery;
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

export const signIn = async (
  data: SignInForm,
  isSignIn: boolean
): Promise<IMessage> => {
  try {
    const query = isSignIn
      ? `mutation ($data: SignInInput){ SignIn (data: $data) { message }}`
      : `mutation ($data: SignUpInput){ SignUp (data: $data) { message }}`;
    const body = JSON.stringify({
      query,
      variables: {
        data: {
          email: data[SignInFieds.Email]?.value || "",
          pwd: data[SignInFieds.Pwd]?.value || "",
        },
      },
    });

    const res = (await axios.post(url, body, config)).data as any;
    if (res?.errors?.length) {
      return { msg: res.errors[0].message, type: MessageType.Error };
    }
    return { msg: res.data.SignUp?.message, type: MessageType.Success };
  } catch (error) {
    return { msg: CONSTS.errors.errorOccured, type: MessageType.Error };
  }
};
