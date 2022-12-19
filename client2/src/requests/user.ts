import { axiosInstance } from ".";
import { IUserInitailState } from "../types/user";

export const getUser = async (): Promise<IUserInitailState> => {
  try {
    const res = (
      await axiosInstance("/api/graphql", {
        data: JSON.stringify({
          query: `
        query User {
            userQuery {
                id
                email
                fName
                lName
                username
                role
                avater
                contactNumber
            }
        }`,
        }),
      })
    ).data;
    if (!res.data.userQuery) throw new Error();
    return res.data.userQuery;
  } catch (err) {
    console.log(err);
    return { email: "" } as any;
  }
};
