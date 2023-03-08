import React from "react";
import { Link } from "react-router-dom";
import SpinLoader from "../Loader/SpinLoader/SpinLoader";
import Styles from "./button.module.scss";

type ButtonProps = {
  value: string;
  type: "button" | "submit";
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  link?: string;
  className?: string;
};

function Button({
  value,
  onClick,
  link,
  isLoading = false,
  disabled = false,
  className = "",
  type,
}: ButtonProps) {
  return (
    <button
      className={`${className} ${Styles.button}`}
      onClick={() => !disabled && onClick && onClick()}
      type={type}
      style={!disabled ? {} : { opacity: "0.8", cursor: "not-allowed" }}
    >
      {!link ? <span>{value}</span> : <Link to={link}>{value}</Link>}
      {isLoading && <SpinLoader radius={9} isSmall />}
    </button>
  );
}

export default Button;
