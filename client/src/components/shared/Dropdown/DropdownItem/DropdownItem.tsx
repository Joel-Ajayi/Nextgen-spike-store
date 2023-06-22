import React from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdownItem.module.scss";

export type DropdownItemProps = {
  icon?: JSX.Element;
  height?: number;
  onClick?: () => void;
  border?: boolean;
  title: string;
  link: string;
};

function DropdownItem({
  icon,
  title,
  link,
  onClick,
  height = 50,
  border = true,
}: DropdownItemProps) {
  return (
    <li className={`${Styles.dropdown_item} ${border ? Styles.border : null}`}>
      {!onClick && (
        <Link to={link} className={Styles.link} style={{ height }}>
          {icon}
          <div className={Styles.title}>{title}</div>
        </Link>
      )}
      {!!onClick && (
        <div className={Styles.link} onClick={onClick} style={{ height }}>
          {icon}
          <div className={Styles.title}>{title}</div>
        </div>
      )}
    </li>
  );
}

export default DropdownItem;
