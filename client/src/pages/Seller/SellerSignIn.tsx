import React from "react";
import { Navigate } from "react-router-dom";
import SellerLogIn from "../../components/SignIn/Seller/SellerSignIn";
import { useAppSelector } from "../../store/hooks";

function SellerSignInPage() {
  const { isAuthenticated } = useAppSelector((state) => state.seller);

  return (
    <>
      {isAuthenticated && <Navigate to="/seller" replace />}
      {!isAuthenticated && <SellerLogIn />}
    </>
  );
}

export default SellerSignInPage;
