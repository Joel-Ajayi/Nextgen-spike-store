import React, {
  useState,
  CSSProperties,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdown.module.scss";
import { IoMdArrowDropdown as CaretIcon } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import uniqId from "uniqid";

export type DropdownProps = {
  rootId?: string;
  id?: string;
  showTitle?: boolean;
  title?: string | JSX.Element;
  wrapperClassName?: string;
  listClassName?: string;
  titleClassName?: string;
  icon?: JSX.Element;
  isDropdown?: true;
  link?: () => string;
  items?: DropdownProps[];
  listOnLoad?: boolean;
  listOnHover?: boolean;
  onClick?: (title: string) => void;
  align?: "r" | "c" | "l";
  pos?: "m-r" | "m-l" | "r-m" | "m" | "t-m";
  childPos?: "m-r" | "m-l" | "r-m" | "m" | "t-m";
  spacebyLine?: boolean;
  showToolTip?: boolean;
  lvl?: number;
};

export default function Dropdown({
  title,
  rootId = uniqId(),
  link,
  icon,
  onClick,
  items = [],
  pos = "t-m",
  childPos = "m",
  listClassName = "",
  wrapperClassName = "",
  titleClassName = "",
  listOnHover = true,
  showTitle = true,
  listOnLoad = false,
  showToolTip = true,
  lvl = 1,
  align = "r",
}: DropdownProps) {
  const [showList, setShowList] = useState(
    listOnLoad || !showTitle || !title || false
  );
  const [dropDownStyle, setDropDownStyle] = useState<CSSProperties>({});
  const [itemsStyles, setItemsStyles] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const myRef = useRef<HTMLDivElement | null>(null);

  const isRoot = lvl === 1;
  const isVerticalPos = pos === "m" || pos === "t-m";

  const alignments = {
    l: Styles.align_l,
    c: Styles.align_c,
    r: Styles.align_r,
  };

  const tooltipClass = (() => {
    if (isRoot) return Styles.align_b;

    switch (pos) {
      case "r-m":
      case "m-r":
        return Styles.align_r;
      case "m-l":
        return Styles.align_l;
      default:
        return isRoot ? Styles.align_b : Styles.none;
    }
  })();

  const getBounds = (showList: boolean): CSSProperties => {
    switch (pos) {
      case "m":
        setItemsStyles({});
        return { position: "static" };
      case "t-m":
        let marginTop = "-80vh";
        const ref = !isRoot ? myRef.current : rootRef.current;
        if (ref && ref.clientHeight) marginTop = `${-ref.clientHeight - 2}px`;

        setItemsStyles({ marginTop: !showList ? marginTop : 0 });
        return {
          position: !isRoot ? "relative" : "absolute",
          overflow: "hidden",
        };
      case "m-r":
        setItemsStyles({});
        return {
          left: `${showList ? 100 : 0}%`,
          top: 0,
          paddingLeft: "0.4rem",
          position: "absolute",
        };
      case "m-l":
        setItemsStyles({});
        return {
          left: `-${showList ? 100 : 0}%`,
          top: 0,
          paddingRight: "0.4rem",
          flexDirection: "row-reverse",
          position: "absolute",
        };
      case "r-m":
        setItemsStyles({});
        return {
          left: `${!showList ? 100 : 0}%`,
          top: 0,
          position: "absolute",
        };
      default:
        return {};
    }
  };

  const setPosStyles = (showList: boolean) => {
    const showOveflow = !(isVerticalPos || pos === "r-m");

    if (rootRef.current) {
      if (!isRoot && showOveflow) {
        if (showList) rootRef.current.style.overflow = "visible";
      } else {
        rootRef.current.style.overflow = "hidden";
      }
    }

    setDropDownStyle({ ...getBounds(showList), zIndex, display: "flex" });
    setShowList(showList);
  };

  useLayoutEffect(() => {
    if (!rootRef.current) {
      rootRef.current = document.getElementById(rootId) as HTMLDivElement;
    }

    setDropDownStyle({ ...getBounds(false), zIndex, display: "flex" });
    return () => {
      setPosStyles(false);
    };
  }, []);

  const handleShowList = (show = !showList) => {
    if (items.length && !!title && !listOnLoad && showTitle) {
      setPosStyles(show);
    }
    if (onClick && typeof title === "string") onClick(title);
  };

  const handleHover = (show: boolean) => {
    if (listOnHover && showList !== show) {
      if (items.length && !!title && !listOnLoad && showTitle) {
        setPosStyles(show);
      }
    }
  };

  const zIndex = useMemo(() => {
    if (pos === "r-m") return 1;
    return pos !== "m-r" && pos !== "m-l" ? -1 : -2;
  }, [showList]);

  const unmount = isRoot ? !showList : false;
  const listItems = useMemo(
    () =>
      items?.map((item) => (
        <li>
          <Dropdown
            key={uniqId()}
            rootId={rootId}
            title={item?.title}
            icon={item?.icon}
            link={item?.link}
            onClick={item?.onClick}
            pos={item?.childPos || childPos}
            childPos={item?.childPos || childPos}
            items={item.items}
            showTitle={item?.showTitle}
            listOnHover={listOnHover}
            listOnLoad={item?.listOnLoad}
            lvl={lvl + 1}
          />
        </li>
      )),
    [items, unmount]
  );

  const titleContent = useMemo(() => {
    return (
      !!title &&
      showTitle && (
        <>
          {showToolTip && showList && showTitle && !!title && pos !== "r-m" && (
            <div className={`${Styles.tooltip} ${tooltipClass}`}>
              <div className={`${Styles.icon} `} />
            </div>
          )}
          {icon}
          {<div className={Styles.title}>{title}</div>}
          {!!items.length && !isRoot && (
            <CaretIcon
              className={Styles.caret}
              style={{ transform: `rotate(${!showList ? -180 : 0}deg)` }}
            />
          )}
        </>
      )
    );
  }, [showList, tooltipClass]);

  const itemsClassName = useMemo(() => {
    return `${Styles.items} ${listClassName} ${
      pos === "r-m" && showList ? Styles.overflow : ""
    } ${isVerticalPos || pos === "r-m" ? Styles.border_bottom : ""} ${
      !(isVerticalPos || pos === "r-m") ? Styles.border : ""
    } ${isVerticalPos ? Styles.no_padding : ""}`;
  }, [showList]);

  return (
    <div
      className={`${wrapperClassName} ${Styles.dropdown_wrapper}`}
      style={{ position: !isRoot ? "static" : "relative" }}
      onPointerEnter={() => handleHover(true)}
      onPointerLeave={() => handleHover(false)}
    >
      {showTitle && (
        <>
          {!!link && !items.length && title && (
            <Link className={`${Styles.title} ${titleClassName}`} to={link()}>
              {titleContent}
            </Link>
          )}
          {(!link || !!items.length) && title && (
            <div
              onClick={() => handleShowList()}
              className={`${Styles.title} ${titleClassName}`}
            >
              {titleContent}
            </div>
          )}
        </>
      )}

      {!!items.length && (
        <div
          className={`${Styles.dropdown} ${!isRoot ? Styles.child : ""} ${
            alignments[align]
          }`}
          ref={myRef}
          id={rootId}
          style={dropDownStyle}
        >
          <div className={itemsClassName} style={itemsStyles}>
            {pos === "r-m" && (
              <div
                className={Styles.return_back}
                onClick={() => handleShowList()}
              >
                <IoIosArrowBack />
                <div>Back</div>
              </div>
            )}
            <ul>{listItems}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
