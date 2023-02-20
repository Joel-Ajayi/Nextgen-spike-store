import jwt from "jsonwebtoken";

export const verifyJWT = async (token: any, secret: any) => {
  const decoded: string | jwt.JwtPayload | undefined = await new Promise(
    (resolve) => {
      jwt.verify(token as string, secret as string, (err, val) => {
        if (!err) {
          resolve(undefined);
        } else {
          resolve(val);
        }
      });
    }
  );

  return decoded;
};
