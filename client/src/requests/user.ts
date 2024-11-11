import axios from "axios";
import request from ".";
import { IUserInitailState, SignInFieds, SignInForm } from "../types/user";

class UserReq {
  public async getUser() {
    const body = JSON.stringify({
      query: `query { UserQuery { contactNumber avatar email roles fName lName id }}`,
    });
    const res = await request.makeRequest<IUserInitailState>(body);
    return res;
  }

  public async signIn(data: SignInForm, isSignIn: boolean) {
    const query = isSignIn
      ? `mutation ($data: SignInInput){ SignIn (data: $data) { message }}`
      : `mutation ($data: SignUpInput){ SignUp (data: $data) { message }}`;

    const commonData = {
      email: data[SignInFieds.Email]?.value || "",
      pwd: data[SignInFieds.Pwd]?.value || "",
    };

    const body = JSON.stringify({
      query,
      variables: {
        data: isSignIn
          ? commonData
          : {
              ...commonData,
              fName: data[SignInFieds.Fname]?.value || "",
              lName: data[SignInFieds.Lname]?.value || "",
            },
      },
    });

    const res = await request.makeRequest<string>(body);
    if (res) {
      return await this.getUser();
    }
    return null;
  }

  public async signOut(): Promise<void> {
    const query = `mutation { SignOut { message }}`;
    const body = JSON.stringify({ query });
    await request.makeRequest(body);
  }
}

const userReq = new UserReq();
export default userReq;
