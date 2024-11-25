import request from ".";
import {
  Address,
  IUserInitailState,
  SignInFieds,
  SignInForm,
} from "../types/user";

class UserReq {
  public async getUser() {
    const body = JSON.stringify({
      query: `query { UserQuery 
      { contactNumber avatar email roles fName lName id addressTypes
        addresses { tel address id name state city locality addressType}
        states { name cities { name localities } }
      }}`,
    });
    const res = await request.makeRequest<IUserInitailState>(
      body,
      false,
      false
    );
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

  public async updateAddress(address_i: Address) {
    const { isNew, ...address } = address_i;
    let query = `mutation UpdateAddress($data:Address_I!) {
      UpdateAddress(data:$data) 
    }`;

    const body = JSON.stringify({ query, variables: { data: address } });
    const res = await request.makeRequest<string>(body);
    return res;
  }
}

const userReq = new UserReq();
export default userReq;
