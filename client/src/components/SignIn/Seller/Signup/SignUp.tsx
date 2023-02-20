import React from "react";
import { useNavigate } from "react-router-dom";

function Seller() {
  const navigate = useNavigate();

  const changeAuth = () => {
    navigate("/seller/login", { replace: true });
  };
  return <div>Seller</div>;
}

export default Seller;
