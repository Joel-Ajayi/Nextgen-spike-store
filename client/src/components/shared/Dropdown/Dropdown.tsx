import React, {
  useState,
  CSSProperties,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdown.module.scss";
import { IoMdArrowDropdown as CaretIcon } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import uniqId from "uniqid";

const childPad = 0.7;

export type DropdownProps = {
  rootId?: string;
  id?: string;
  showTitle?: boolean;
  title?: string | JSX.Element;
  wrapperClassName?: string;
  listClassName?: string;
  titleClassName?: string;
  Icon?: React.FC;
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
  initSelectedItems?: string[];
  onSelect?: () => void;
  isSelected?: boolean;
  isCheckListItem?: boolean;
  isCheckList?: boolean;
  isRadioList?: boolean;
  paddingLeft?: number;
  showToolTip?: boolean;
  isSelection?: boolean;
  showSelectionButton?: boolean;
  showListSelectionButton?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  lvl?: number;
};

export default function Dropdown({
  id,
  title,
  link,
  Icon,
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
  onSelect,
  listOnLoad = false,
  showCaret = true,
  showToolTip = true,
  isCheckListItem = false,
  initSelectedItems = [],
  isCheckList = false,
  isRadioList = false,
  isSelected = false,
  showSelectionButton = true,
  showListSelectionButton = true,
  borderTop = false,
  borderBottom = false,
  isSelection = false,
  paddingLeft = childPad,
  lvl = 1,
  align = "r",
}: DropdownProps) {
  const initShow = listOnLoad || !showTitle || !title || pos === "m";
  const [showList, setShowList] = useState(initShow);
  const [dropDownStyle, setDropDownStyle] = useState<CSSProperties>({});
  const [itemsStyles, setItemsStyles] = useState<CSSProperties>({});
  const [myRefState, setMyRefState] = useState<CSSStyleDeclaration>();
  const [selectedItems, setSelected] = useState(initSelectedItems);
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

  const onChildSelect = (id: string) => {
    if (isRadioList || isCheckList) {
      if (isCheckList) {
        setSelected((ids) =>
          !ids.includes(id) ? [...ids, id] : ids.filter((iId) => iId !== id)
        );
      } else {
        setSelected(() => [id]);
      }
    }
  };

  const handleShowList = (show = !showList) => {
    if (items.length && !!title && !listOnLoad && showTitle && pos !== "m") {
      setPosStyles(show);
    }
    if (onClick && typeof title === "string") onClick(title);
    if (onSelect) onSelect();
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
      items?.map((item, i) => (
        <li key={uniqId()}>
          <Dropdown
            id={`${i}`}
            title={item?.title}
            Icon={item?.Icon}
            link={item?.link}
            onClick={item?.onClick}
            onSelect={() => onChildSelect(`${i}`)}
            pos={item?.childPos || childPos}
            childPos={item?.childPos || childPos}
            items={item.items}
            showTitle={item?.showTitle}
            rootRef={isRoot ? myRefState : rootRef}
            listOnHover={listOnHover}
            isCheckList={item?.isCheckList}
            isRadioList={item?.isRadioList}
            isCheckListItem={isCheckList}
            isSelection={isCheckList || isRadioList}
            isSelected={selectedItems.includes(`${i}`)}
            showListSelectionButton={item?.showListSelectionButton}
            showSelectionButton={showListSelectionButton}
            showCaret={item?.showCaret}
            borderTop={item?.borderTop}
            borderBottom={item?.borderBottom}
            listOnLoad={item?.listOnLoad}
            titleClassName={item?.titleClassName}
            paddingLeft={
              !!title && showTitle ? paddingLeft + childPad : paddingLeft
            }
            initSelectedItems={item?.initSelectedItems}
            lvl={lvl + 1}
          />
        </li>
      )),
    [items, showList, selectedItems, myRefState]
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
          {link && link() ? (
            <Link className={Styles.inner_title} to={link()}>
              {Icon && <Icon />}
              {title}
              {borderTop ? <div className={Styles.border_top} /> : null}
              {borderBottom ? <div className={Styles.border_bottom} /> : null}
            </Link>
          ) : (
            <div
              className={`${Styles.inner_title} ${
                isSelected && !showSelectionButton ? Styles.bold : ""
              }`}
              onClick={() => handleShowList()}
            >
              {Icon && <Icon />}
              {isSelection && showSelectionButton ? (
                <input
                  type={isCheckListItem ? "checkbox" : "radio"}
                  onChange={() => {}}
                  checked={isSelected}
                />
              ) : null}
              {title}
              {borderTop ? <div className={Styles.border_top} /> : null}
              {borderBottom ? <div className={Styles.border_bottom} /> : null}
              {showCaret && items.length ? (
                <CaretIcon
                  className={Styles.caret}
                  onClick={() => handleShowList()}
                  style={{
                    transform: `rotate(${
                      showList || pos === "m" ? 0 : -180
                    }deg)`,
                  }}
                />
              ) : null}
            </div>
          )}
        </>
      )
    );
  }, [showList, tooltipClass, showCaret]);

  const titleClass = useMemo(() => {
    return `${Styles.title} ${titleClassName}  ${
      borderTop ? Styles.border_top : ""
    }
      ${borderBottom ? Styles.border_bottom : ""}`;
  }, []);

  const itemsClassName = useMemo(() => {
    return `${Styles.items} ${listClassName} ${
      pos === "r-m" && showList ? Styles.overflow : ""
    }  ${isVerticalPos ? Styles.no_padding : ""}`;
  }, [showList]);

  const itemsWrapperClassName = useMemo(
    () =>
      `${Styles.dropdown} ${!isRoot ? Styles.child : ""} ${alignments[align]} 
     
       ${
         showTitle && !!title && !isRoot && isVerticalPos
           ? Styles.child_padding
           : ""
       } ${
        (!(isVerticalPos || pos === "r-m") || isRoot) &&
        !borderBottom &&
        !borderTop &&
        showList
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
      {showTitle && !!title && (
        <>
          <div
            className={titleClass}
            style={{ paddingLeft: `${paddingLeft}rem` }}
          >
            {titleContent}
          </div>
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
                <div>{title}</div>
              </div>
            )}
            <ul>{listItems}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
