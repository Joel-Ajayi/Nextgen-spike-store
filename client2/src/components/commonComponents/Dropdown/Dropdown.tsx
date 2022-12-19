import React, { useState, CSSProperties, useMemo } from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdown.module.scss";
import { ReactComponent as CaretIcon } from "./../../images/icons/caret.svg";
import DropdownItem, { DropdownItemProps } from "./DropdownItem/DropdownItem";
import uniqId from "uniqid";

export type DropdownProps = {
  title: string;
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
  titleClassName,
  listClassName,
  isDropdown = true,
  listOnLoad = false,
  listOnHover = true,
  spacebyLine = true,
  showCaret = true,
  showToolTip = true,
}: DropdownProps) {
  const [showList, setShowList] = useState(false);

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
          />
        );
      }

      return item as JSX.Element;
    });
  }, [items]);

  return (
    <div
      className={`${wrapperClassName} ${
        listOnHover ? Styles.dropdown_on_hover : null
      }`}
    >
      <div className={titleClassName || Styles.title} onClick={handleOnClick}>
        {!!icon ? icon : null}
        {!link ? <span>{title}</span> : <Link to={link as string}></Link>}
        {showCaret && (
          <CaretIcon
            className={Styles.caret}
            style={
              {
                transform: `rotate(${showList ? -180 : 0}deg)`,
              } as CSSProperties
            }
          />
        )}
      </div>
      {items?.length && (listOnLoad || showList || listOnHover) && (
        <div
          className={Styles.dropdown}
          style={
            (!listOnHover && showList) || listOnLoad
              ? { display: "block" }
              : undefined
          }
        >
          {showToolTip && (
            <div className={showToolTip ? Styles.tooltip : undefined} />
          )}
          <div className={Styles.items}>
            <ul>{listItems}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
