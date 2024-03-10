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
  showCaret?: boolean;
  rootRef?: CSSStyleDeclaration;
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
  rootRef,
  listOnLoad = false,
  showCaret = !!items.length,
  showToolTip = true,
  lvl = 1,
  align = "r",
}: DropdownProps) {
  const initShow = listOnLoad || !showTitle || !title || pos === "m";
  const [showList, setShowList] = useState(initShow);
  const [dropDownStyle, setDropDownStyle] = useState<CSSProperties>({});
  const [itemsStyles, setItemsStyles] = useState<CSSProperties>({});
  const [myRefState, setMyRefState] = useState<CSSStyleDeclaration>();
  const myRef = useRef<HTMLDivElement | null>(null);
  let myHeight = useRef<null | number>(0);

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
        const ref = myRef.current;
        if (ref && ref.clientHeight) {
          if (!myHeight.current) {
            myHeight.current = ref.clientHeight;
          }
          marginTop = `-${(myHeight.current || ref.clientHeight) + 2}px`;
        }

        setItemsStyles({
          marginTop: !showList ? marginTop : 0,
          position: isRoot ? "relative" : undefined,
        });
        return {
          position: !isRoot ? "static" : "absolute",
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
    const ref = isRoot ? myRefState : rootRef;
    if (ref) {
      if (!isRoot && showOveflow) {
        if (showList) ref.overflow = "visible";
      } else if (isRoot && !showList) {
        ref.overflow = "hidden";
      }
    }

    setDropDownStyle({ ...getBounds(showList), zIndex });
    setShowList(showList);
  };

  useEffect(() => {
    if (myRef.current && isRoot) {
      setMyRefState(myRef.current.style);
    }
  }, [myRef.current]);

  useLayoutEffect(() => {
    setDropDownStyle({ ...getBounds(initShow), zIndex });
  }, []);

  const handleShowList = (show = !showList) => {
    if (items.length && !!title && !listOnLoad && showTitle && pos !== "m") {
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
    return isVerticalPos ? 0 : -1;
  }, [showList]);

  const listItems = useMemo(
    () =>
      items?.map((item) => (
        <li key={uniqId()}>
          <Dropdown
            key={uniqId()}
            title={item?.title}
            icon={item?.icon}
            link={item?.link}
            onClick={item?.onClick}
            pos={item?.childPos || childPos}
            childPos={item?.childPos || childPos}
            items={item.items}
            showTitle={item?.showTitle}
            rootRef={isRoot ? myRefState : rootRef}
            listOnHover={listOnHover}
            listOnLoad={item?.listOnLoad}
            lvl={lvl + 1}
          />
        </li>
      )),
    [items, showList, myRefState]
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
          {link && link() ? (
            <Link className={Styles.title} to={link()}>
              {title}
            </Link>
          ) : (
            <div className={Styles.title} onClick={() => handleShowList()}>
              {title}
            </div>
          )}
          {showCaret && (
            <CaretIcon
              className={Styles.caret}
              onClick={() => handleShowList()}
              style={{
                transform: `rotate(${showList || pos === "m" ? 0 : -180}deg)`,
              }}
            />
          )}
        </>
      )
    );
  }, [showList, tooltipClass, showCaret]);

  const titleClass = useMemo(() => {
    return `${Styles.title} ${titleClassName}`;
  }, []);

  const itemsClassName = useMemo(() => {
    return `${Styles.items} ${listClassName} ${
      pos === "r-m" && showList ? Styles.overflow : ""
    }  ${isVerticalPos ? Styles.no_padding : ""}`;
  }, [showList]);

  const itemsWrapperClassName = useMemo(
    () =>
      `${Styles.dropdown} ${!isRoot ? Styles.child : ""} ${alignments[align]} ${
        (isVerticalPos || pos === "r-m") && showList ? Styles.border_bottom : ""
      } ${
        showTitle && !!title && !isRoot && isVerticalPos
          ? Styles.child_padding
          : ""
      } ${
        (!(isVerticalPos || pos === "r-m") || isRoot) && showList
          ? Styles.border
          : ""
      } ${isRoot ? Styles.root : ""}`,
    [showList]
  );

  return (
    <div
      className={`${wrapperClassName} ${Styles.dropdown_wrapper}`}
      style={{ position: !isRoot ? "static" : "relative" }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      {showTitle && (
        <>
          <div className={titleClass}>{titleContent}</div>
        </>
      )}

      {!!items.length && (
        <div
          className={itemsWrapperClassName}
          ref={myRef}
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
