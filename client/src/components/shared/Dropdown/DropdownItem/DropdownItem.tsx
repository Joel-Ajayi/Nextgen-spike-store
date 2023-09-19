import React from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdownItem.module.scss";

export type DropdownItemProps = {
  icon?: JSX.Element;
  height?: number;
  onClick?: (title: string) => void;
  border?: boolean;
  title: string;
  link: string;
  highlight?: boolean;
};

function DropdownItem({
  icon,
  title,
  link,
  onClick,
  border = true,
  highlight = false,
}: DropdownItemProps) {
  return (
    <li className={Styles.dropdown_item}>
      {!onClick && (
        <Link to={link} className={Styles.link}>
          {icon}
          <div className={`${Styles.title} ${highlight ? Styles.title_bg : Styles.title_txt}`}>{title}</div>
        </Link>
      )}
      {!!onClick && (
        <div className={Styles.link} onClick={() => onClick(title)} >
          {icon}
          <div className={`${Styles.title} ${highlight ? Styles.title_bg : Styles.title_txt}`}>{title}</div>
        </div>
      )}
    </li>
  );
}

export default DropdownItem;
