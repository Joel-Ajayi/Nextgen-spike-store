import React, { useLayoutEffect, useState } from "react";
import Styles from "./signIn.module.scss";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../shared/Input/Input";
import appSlice from "../../store/appState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import userReq from "../../requests/user";
import { SignInFieds, SignInForm } from "../../types/user";
import userSlice from "../../store/userState";
import userValidator from "../../validators/user";
import Button from "../shared/Button/Button";

function SignIn() {
  let [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();

  const setShowModal = appSlice.actions.setShowModal;
  const setUserState = userSlice.actions.setUserState;
  const isSignPage = pathname === "/signin";

  const isModalVisible = useAppSelector((state) => state.app.showModal);

  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState<SignInForm>({});
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    if (params.get("signup") === "true") {
      navigate(pathname, { replace: true });
      setIsSignIn(false);
    }
  }, [params]);

  const changeAuth = () => {
    if (isModalVisible && isSignPage) dispatch(setShowModal(false));
    setIsSignIn(!isSignIn);
    setFormData({ ...formData, fName: undefined, lName: undefined });
  };

  const onInputChange = async (
    value: string,
    name: string
  ): Promise<string | void> => {
    const { error } = await userValidator.signIn(name as SignInFieds, value);
    setFormData({ ...formData, [name]: { value, err: error } });
    return error;
  };

  const onSubmit = async (e: React.FormEvent) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    const user = await userReq.signIn(formData, isSignIn);
    if (user) {
      dispatch(setUserState({ ...user, isAuthenticated: true }));
      dispatch(setShowModal(false));
    }
    setIsLoading(false);
  };

  return (
    <div className={Styles.content_wrapper}>
      <div className={Styles.content}>
        <div className={Styles.login_wrapper}>
          <div className={Styles.info_wrapper}>
            <img src="/uploads/login_img" />
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
              {!isSignIn && (
                <>
                  <Input
                    name={SignInFieds.Fname}
                    placeholder="Enter First Name"
                    onChange={onInputChange}
                  />
                  <Input
                    name={SignInFieds.Lname}
                    placeholder="Enter Last Name"
                    onChange={onInputChange}
                  />
                </>
              )}
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
                type="password"
              />
              <div className={Styles.info}>
                <p>
                  By continuing, you agree to NextgenSpike's Terms of Use and
                  Privacy Policy.
                </p>
              </div>
              <div>
                <Button
                  className={Styles.submit_button}
                  isLoading={isLoading}
                  type="submit"
                  value={isSignIn ? "Log In" : "Create Account"}
                />
              </div>
            </form>
            <div className={Styles.toggle_auth} onClick={changeAuth}>
              {isSignIn
                ? "New to NextgenSpike ?. Create Account"
                : "Existing User ?. Log in"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
