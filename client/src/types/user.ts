export enum SignInFieds {
  Email = "email",
  Pwd = "pwd",
}

export type SignInForm = {
  [key in SignInFieds]?: { value: ""; err: "" };
};
