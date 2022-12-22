import React, { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../../commonComponents/Input/Input";
import Styles from "./login.module.scss";

export default function Login() {
  let [params] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isLogin, setIsLogin] = useState(
    (params.get("signup") === "true" && pathname === "/login") ||
      pathname !== "/login"
  );

  const changeAuth = () => {
    if (pathname !== "/login") {
      navigate(`/login${isLogin ? "?signup=true" : ""}`, { replace: true });
    } else {
      setIsLogin(!isLogin);
    }
  };

  return (
    <div className={Styles.login_wrapper}>
      <div className={Styles.info_wrapper}>
        <div className={Styles.info}>
          {isLogin && (
            <>
              <h1>Login</h1>
              <p>Get access to your Orders, Whishlist and Recommendations</p>
            </>
          )}
          {!isLogin && (
            <>
              <h1>Looks like you're new here</h1>
              <p>Sign up with your email to get started</p>
            </>
          )}
        </div>
      </div>
      <div className={Styles.form_wrapper}>
        <form>
          <Input placeholder="Enter Email" />
          <Input placeholder="Enter Password" />
          <div className={Styles.info}>
            <p>
              By continuing, you agree to Flipkart's Terms of Use and Privacy
              Policy.
            </p>
          </div>
          <div>
            <button className={Styles.login_button}>Login</button>
          </div>
        </form>
        <div className={Styles.toggle_auth}>
          {isLogin && (
            <p onClick={changeAuth}>New to Flipkart ?. Create Account</p>
          )}
          {!isLogin && <p onClick={changeAuth}>Existing User ?. Log in</p>}
        </div>
      </div>
    </div>
  );
}
