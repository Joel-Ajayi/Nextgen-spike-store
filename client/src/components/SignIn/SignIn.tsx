import React, { useEffect, useLayoutEffect, useState } from "react";
import Styles from "./signIn.module.scss";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../shared/Input/Input";
import appSlice from "../../store/appState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import validator from "../../helpers/validators";
import userReq from "../../requests/user";
import { SignInForm } from "../../types/user";
import { MessageType } from "../../types";
import userSlice from "../../store/userState";

enum SignInFieds {
  Email = "email",
  Pwd = "pwd",
}

function SignIn() {
  let [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();

  const { setShowModal, setBackgroundMsg } = appSlice.actions;
  const { setUserState } = userSlice.actions;
  const isSignPage = pathname === "/signin";

  const isModalVisible = useAppSelector((state) => state.app.showModal);

  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState<SignInForm>({});

  useLayoutEffect(() => {
    if (params.get("signup") === "true") {
      navigate(pathname, { replace: true });
      setIsSignIn(false);
    }
  }, [params]);

  const changeAuth = () => {
    if (isModalVisible && isSignPage) dispatch(setShowModal(false));
    setIsSignIn(!isSignIn);
  };

  const onInputChange = async (
    value: string,
    name: string
  ): Promise<string | void> => {
    try {
      const valFunc =
        name === SignInFieds.Pwd ? validator.signInPwd() : validator.email();
      await valFunc.validate(value);
      setFormData({ ...formData, [name]: { value, err: "" } });
    } catch (error) {
      setFormData({
        ...formData,
        [name]: { value, err: (error as any).message },
      });
      return (error as any).message;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const msg = await userReq.signIn(formData, isSignIn);
    if (msg.type === MessageType.Error) {
      dispatch(setBackgroundMsg(msg));
    } else {
      dispatch(
        setUserState({
          email: formData[SignInFieds.Email]?.value as string,
          isAuthenticated: true,
          role: 0,
          avatar: "",
        })
      );
      dispatch(setShowModal(false));
    }
  };

  return (
    <div className={Styles.content_wrapper}>
      <div className={Styles.content}>
        <div className={Styles.login_wrapper}>
          <div className={Styles.info_wrapper}>
            <div className={Styles.info}>
              {isSignIn && (
                <>
                  <h1>Log In</h1>
                  <p>
                    Get access to your Orders, Whishlist and Recommendations
                  </p>
                </>
              )}
              {!isSignIn && (
                <>
                  <h1>Looks like you're new here</h1>
                  <p>Sign up with your email to get started</p>
                </>
              )}
            </div>
          </div>
          <div className={Styles.form_wrapper}>
            <form onSubmit={onSubmit}>
              <Input
                name={SignInFieds.Email}
                placeholder="Enter Email"
                onChange={onInputChange}
              />
              <Input
                name={SignInFieds.Pwd}
                placeholder="Enter Password"
                onChange={onInputChange}
                autoComplete="off"
              />
              <div className={Styles.info}>
                <p>
                  By continuing, you agree to Flipkart's Terms of Use and
                  Privacy Policy.
                </p>
              </div>
              <div>
                {!isSignIn && (
                  <button className={Styles.login_button}>
                    Create Account
                  </button>
                )}
                {isSignIn && (
                  <button className={Styles.login_button}>Login</button>
                )}
              </div>
            </form>
            <div className={Styles.toggle_auth}>
              {isSignIn && (
                <p onClick={changeAuth}>New to Flipkart ?. Create Account</p>
              )}
              {!isSignIn && <p onClick={changeAuth}>Existing User ?. Log in</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
