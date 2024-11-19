import React from "react";
import { Link } from "react-router-dom";
import SpinLoader from "../Loader/SpinLoader/SpinLoader";
import Styles from "./button.module.scss";

type ButtonProps = {
  value: string | JSX.Element;
  type?: "button" | "submit";
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  link?: string;
  fontSize?: number;
  padTop?: number;
  padSide?: number;
  shadow?: boolean;
  width?: string;
  className?: string;
};

function Button({
  value,
  onClick,
  link,
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  fontSize = 0.9,
  shadow = true,
  padSide = 1.2,
  padTop = 0.5,
  width = "auto",
}: ButtonProps) {
  const passedValue = typeof value === "string" ? <span>{value}</span> : value;

  return (
    <button
      className={`${Styles.button} ${shadow ? Styles.shadow : ""} ${className}`}
      onClick={() => !disabled && onClick && onClick()}
      type={type}
      style={{
        width,
        fontSize: `${fontSize}rem`,
        padding: `${padTop}rem ${padSide}rem`,
        opacity: disabled ? 0.8 : 1,
        cursor: disabled ? "not-allowed" : undefined,
      }}
    >
      {!link ? passedValue : <Link to={link}>{value}</Link>}
      {isLoading && <SpinLoader radius={10} isSmall />}
    </button>
  );
}

export default Button;
