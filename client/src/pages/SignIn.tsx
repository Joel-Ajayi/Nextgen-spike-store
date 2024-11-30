import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import SignIn from "../components/SignIn/SignIn";
import { useAppSelector } from "../store/hooks";

function SignInPage() {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  let [params] = useSearchParams();
  const redirect = params.get("redirect") || "";

  return (
    <>
      {isAuthenticated && <Navigate to={`/${redirect}`} replace />}
      {!isAuthenticated && (
        <>
          <BackgroundMsg />
          <SignIn />
        </>
      )}
    </>
  );
}

export default SignInPage;
