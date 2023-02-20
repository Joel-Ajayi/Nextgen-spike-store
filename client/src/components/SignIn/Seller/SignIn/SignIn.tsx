import React from "react";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();

  const changeAuth = () => {
    navigate("/seller/login?signup=true", { replace: true });
  };

  return <div>Login</div>;
}

export default SignIn;
