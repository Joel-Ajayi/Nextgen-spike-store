import React from "react";
import { useSearchParams } from "react-router-dom";
import SignUp from "./Signup/SignUp";
import LogIn from "./SignIn/SignIn";
import Styles from "./sellerSignIn.module.scss";

function SellerSignIn() {
  let [params] = useSearchParams();
  const isSignIn = params.get("signup") !== "true";

  return (
    <div className={Styles.content_wrapper}>
      <div className={Styles.content}>
        {isSignIn && <LogIn />}
        {!isSignIn && <SignUp />}
      </div>
    </div>
  );
}

export default SellerSignIn;
