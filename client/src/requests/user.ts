import axios from "axios";
import { makeRequest } from ".";
import { IMessage, MessageType } from "../types";
import { IUserInitailState, SignInFieds, SignInForm } from "../types/user";

class UserReq {
  public async getUser(): Promise<IUserInitailState | null | IMessage> {
    const body = JSON.stringify({
      query: `query { UserQuery { contactNumber avatar email role fullName id }}`,
    });

    try {
      const res = await makeRequest(body);
      return res.UserQuery;
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      };
    }
  }

  public async signIn(data: SignInForm, isSignIn: boolean): Promise<IMessage> {
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

    try {
      const res = await makeRequest(body);
      return {
        msg: res.data.SignUp?.message,
        type: MessageType.Success,
        statusCode: 200,
      };
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      };
    }
  }
}

const userReq = new UserReq();
export default userReq;
