import axios from "axios";
import request from ".";
import { IMessage, MessageType } from "../types";
import { IUserInitailState, SignInFieds, SignInForm } from "../types/user";

class UserReq {
  public async getUser() {
    const body = JSON.stringify({
      query: `query { UserQuery { contactNumber avatar email role fullName id }}`,
    });
    const { res, msg } = await request.makeRequest<IUserInitailState>(body);
    return { user: res, msg };
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

    const { res, msg } = await request.makeRequest<string>(body);
    return !msg
      ? { msg: res, type: MessageType.Success, statusCode: 200 }
      : msg;
  }

  public async signOut(): Promise<void> {
    const query = `mutation { SignOut { message }}`;
    const body = JSON.stringify({ query });
    await request.makeRequest(body);
  }
}

const userReq = new UserReq();
export default userReq;
