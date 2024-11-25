import React, {
  useState,
  CSSProperties,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  ChangeEvent,
} from "react";
import { Link } from "react-router-dom";
import Styles from "./dropdown.module.scss";
import { IoMdArrowDropdown as CaretIcon } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import uniqId from "uniqid";
import { IoClose } from "react-icons/io5";
import Input from "../Input/Controller/Input";
import { BsDashLg } from "react-icons/bs";
import helpers from "../../../helpers";

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
  onSelect?: (value: any) => void;
  isSearch?: boolean;
  isRange?: boolean;
  isSelected?: boolean;
  isCheckListItem?: boolean;
  isCheckList?: boolean;
  isRadioList?: boolean;
  paddingLeft?: number;
  showToolTip?: boolean;
  isSelection?: boolean;
  showSelectionButton?: boolean;
  minRange?: number;
  maxRange?: number;
  selectedMinRange?: number;
  selectedMaxRange?: number;
  overflowY?: boolean;
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
  isSearch = false,
  overflowY = false,
  showSelectionButton = true,
  showListSelectionButton = true,
  isRange = false,
  minRange = 1,
  maxRange = 10000000,
  selectedMaxRange = 8000000,
  selectedMinRange = 1000,
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
  const [search, setSearch] = useState("");
  const [range, setRange] = useState({
    min: minRange,
    max: maxRange,
  });
  const rangeWidth = range.max - range.min;
  const [selectedRange, setSelectedRange] = useState({
    min: (selectedMinRange - range.min) / rangeWidth,
    max: (selectedMaxRange - range.min) / rangeWidth,
  });

  const myRef = useRef<HTMLDivElement | null>(null);
  const rangeInterval = useRef<NodeJS.Timeout | null>(null);
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

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const getRangeWidth = (num: number, comp = rangeWidth) => {
    return num * comp + range.min;
  };
  const onRangeChange = (
    value: number,
    func: (
      value: React.SetStateAction<{
        min: number;
        max: number;
      }>
    ) => void,
    isSelectedRange = true,
    isMin = true
  ) => {
    const comp = isSelectedRange ? rangeWidth : 1;
    const min = isSelectedRange ? range.min : 0;
    const limit = (isSelectedRange ? 0.085 : 0.05) * rangeWidth;
    if (isMin) {
      func((prev) => ({
        ...prev,
        min:
          getRangeWidth(prev.max, comp) - value <= limit || value < 0
            ? prev.min
            : (value - min) / comp,
      }));
    } else {
      func((prev) => ({
        ...prev,
        max:
          value - getRangeWidth(prev.min, comp) <= limit || value > 100000000
            ? prev.max
            : (value - min) / comp,
      }));
    }
    if (onClick && isSelectedRange) {
      if (rangeInterval.current) {
        clearTimeout(rangeInterval.current);
        rangeInterval.current = null;
      }
      rangeInterval.current = setTimeout(() => {
        onClick(
          `${getRangeWidth(selectedRange.min)}+${getRangeWidth(
            selectedRange.max
          )}_ ${range.min}+${range.max}`
        );
        if (rangeInterval.current) {
          clearTimeout(rangeInterval.current);
        }
        rangeInterval.current = null;
      }, 500);
    }
  };

  const handleShowList = (show = !showList) => {
    if (items.length && !!title && !listOnLoad && showTitle && pos !== "m") {
      setPosStyles(show);
    }
    if (onClick) onClick(typeof title === "string" ? title : "");
    if (onSelect) onSelect(null);
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
      items?.map((item, i) =>
        !search ||
        new RegExp(search, "ig").test(item?.title as string) ||
        selectedItems.includes(`${i}`) ? (
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
              items={item?.items}
              showTitle={item?.showTitle}
              rootRef={isRoot ? myRefState : rootRef}
              listOnHover={listOnHover}
              isRange={item?.isRange}
              isSearch={item?.isSearch}
              isCheckList={item?.isCheckList}
              isRadioList={item?.isRadioList}
              isCheckListItem={isCheckList}
              isSelection={isCheckList || isRadioList}
              overflowY={item?.overflowY}
              isSelected={selectedItems.includes(`${i}`)}
              showListSelectionButton={item?.showListSelectionButton}
              showSelectionButton={showListSelectionButton}
              showCaret={item?.showCaret}
              minRange={item?.minRange}
              selectedMaxRange={item?.selectedMaxRange}
              selectedMinRange={item?.selectedMinRange}
              maxRange={item?.maxRange}
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
        ) : null
      ),
    [items, showList, selectedItems, myRefState]
  );

  const titleContent = useMemo(() => {
    return (
      <>
        {showToolTip && showList && showTitle && !!title && pos !== "r-m" && (
          <div className={`${Styles.tooltip} ${tooltipClass}`}>
            <div className={`${Styles.icon} `} />
          </div>
        )}
        {link && link() && !!title && showTitle ? (
          <Link className={Styles.inner_title} to={link()}>
            {Icon && <Icon />}
            {title}
            {borderTop ? <div className={Styles.border_top} /> : null}
            {borderBottom ? <div className={Styles.border_bottom} /> : null}
          </Link>
        ) : (
          !!title &&
          showTitle && (
            <div
              className={`${Styles.inner_title} ${
                isSelected && !showSelectionButton ? Styles.bold : ""
              }`}
              onClick={() => handleShowList()}
            >
              {Icon && <Icon />}
              {isSelection && showSelectionButton ? (
                <input
                  aria-hidden={false}
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
          )
        )}
        {isSearch ? (
          <div className={Styles.search}>
            <input
              type="text"
              onChange={onSearch}
              value={search}
              aria-hidden={false}
            />
            {!!search && <IoClose onClick={() => setSearch("")} />}
          </div>
        ) : null}
        {isRange ? (
          <div className={Styles.range}>
            <div className={Styles.slider_and_input}>
              <div className={Styles.slider}>
                <span
                  style={{
                    left: `${selectedRange.min * 100}%`,
                    width: `${(selectedRange.max - selectedRange.min) * 100}%`,
                  }}
                  className={Styles.selected}
                />
                <span
                  className={Styles.value}
                  style={{ left: `${selectedRange.min * 100}%` }}
                >
                  {helpers.reduceNumLength(getRangeWidth(selectedRange.min))}
                </span>
                <span
                  className={Styles.value}
                  style={{ right: `${100 - selectedRange.max * 100}%` }}
                >
                  {helpers.reduceNumLength(getRangeWidth(selectedRange.max))}
                </span>
              </div>
              <div className={Styles.input}>
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  value={getRangeWidth(selectedRange.min)}
                  onChange={async ({ target: { value } }) => {
                    onRangeChange(Number(value), setSelectedRange);
                  }}
                />
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  value={getRangeWidth(selectedRange.max)}
                  onChange={async ({ target: { value } }) => {
                    onRangeChange(Number(value), setSelectedRange, true, false);
                  }}
                />
              </div>
            </div>
            <div className={Styles.setters}>
              <Input
                name="Min"
                type="number"
                onChange={async (min) =>
                  onRangeChange(Number(min), setRange, false)
                }
                defaultValue={range.min}
              />
              <BsDashLg />
              <Input
                name="Max"
                type="number"
                onChange={async (max) =>
                  onRangeChange(Number(max), setRange, false, false)
                }
                defaultValue={range.max}
              />
            </div>
          </div>
        ) : null}
      </>
    );
  }, [showList, tooltipClass, showCaret, search, range, selectedRange]);

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
    ${pos === "m" && showList && overflowY ? Styles.overflow_y : ""}
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
