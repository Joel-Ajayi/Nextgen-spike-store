import React from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdownItem.module.scss";

export type DropdownItemProps = {
  icon?: JSX.Element;
  height?: number;
  border?: boolean;
  title: string;
  link: string;
};

function DropdownItem({
  icon,
  title,
  link,
  height = 50,
  border = true,
}: DropdownItemProps) {
  return (
    <li className={`${Styles.dropdown_item} ${border ? Styles.border : null}`}>
      <Link to={link} className={Styles.link} style={{ height }}>
        {icon}
        <div className={Styles.title}>{title}</div>
      </Link>
    </li>
  );
}

export default DropdownItem;
