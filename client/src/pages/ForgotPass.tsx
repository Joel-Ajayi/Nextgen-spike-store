import React from "react";
import { useAppSelector } from "../store/hooks";
import { Navigate, useSearchParams } from "react-router-dom";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import ForgotPass from "../components/ForgotPass/ForgotPass";

function ForgotPassPage() {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  let [params] = useSearchParams();
  const redirect = params.get("redirect") || "";

  return (
    <>
      {isAuthenticated && <Navigate to={`/${redirect}`} replace />}
      {!isAuthenticated && (
        <>
          <BackgroundMsg />
          <ForgotPass />
        </>
      )}
    </>
  );
}

export default ForgotPassPage;
