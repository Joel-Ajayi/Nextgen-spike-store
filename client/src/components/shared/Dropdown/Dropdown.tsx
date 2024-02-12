import React, { useState, CSSProperties, useMemo } from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdown.module.scss";
import { ReactComponent as CaretIcon } from "./../../../images/icons/caret.svg";
import DropdownItem, { DropdownItemProps } from "./DropdownItem/DropdownItem";
import uniqId from "uniqid";

export type DropdownProps = {
  title: string | JSX.Element;
  level: number;
  wrapperClassName: string;
  icon?: JSX.Element;
  isDropdown?: true;
  showCaret?: boolean;
  link?: string;
  items?: (DropdownProps | DropdownItemProps | JSX.Element)[];
  listOnLoad?: boolean;
  listOnHover?: boolean;
  onClick?: () => void;
  position?: "l" | "c" | "r";
  titleClassName?: string;
  listClassName?: string;
  spacebyLine?: boolean;
  showToolTip?: boolean;
};

export default function Dropdown({
  title,
  wrapperClassName,
  link,
  icon,
  onClick,
  items,
  position = "c",
  titleClassName,
  listClassName = "",
  listOnLoad = false,
  listOnHover = true,
  showCaret = true,
  showToolTip = true,
}: DropdownProps) {
  const [showList, setShowList] = useState(false);
  const pos = { l: {}, c: Styles.pos_center, r: Styles.pos_right };

  const handleOnClick = () => {
    if (!listOnHover) setShowList(!showList);
    if (onClick) onClick();
  };

  const listItems = useMemo(() => {
    return items?.map((item) => {
      if ((item as DropdownProps)?.isDropdown) return null;

      if ((item as DropdownItemProps)?.title) {
        return (
          <DropdownItem
            key={uniqId()}
            title={(item as DropdownItemProps).title}
            icon={(item as DropdownItemProps).icon}
            link={(item as DropdownItemProps).link}
            onClick={(item as DropdownItemProps).onClick}
          />
        );
      }

      return item as JSX.Element;
    });
  }, [items]);

  return (
    <div
      className={`${wrapperClassName} ${Styles.dropdown_wrapper} ${
        listOnHover ? Styles.dropdown_on_hover : null
      }`}
    >
      <div className={titleClassName || Styles.title} onClick={handleOnClick}>
        {!!icon ? icon : null}
        {!link ? <div>{title}</div> : <Link to={link as string}>{title}</Link>}
        {showCaret && !link && (
          <CaretIcon
            className={Styles.caret}
            style={{ transform: `rotate(${showList ? -180 : 0}deg)` }}
          />
        )}
      </div>
      {!!items?.length && (listOnLoad || showList || listOnHover) && (
        <div
          className={`${Styles.dropdown} ${pos[position]}`}
          style={
            (!listOnHover && showList) || listOnLoad
              ? { display: "block" }
              : undefined
          }
        >
          {showToolTip && (
            <div
              className={`${
                showToolTip ? Styles.tooltip : undefined
              } ${listClassName} ${pos[position]}`}
            />
          )}
          <div className={`${Styles.items} ${listClassName}`}>
            <ul>{listItems}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
