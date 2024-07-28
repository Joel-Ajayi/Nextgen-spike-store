import React, { useState, useRef, useEffect, CSSProperties } from "react";
import Styles from "./sidebar.module.scss";
import { HiBars3BottomLeft as SideBarIcon } from "react-icons/hi2";
import { IoArrowBack } from "react-icons/io5";
import { CONSTS } from "../../../../const";
import { useLocation } from "react-router-dom";
type BarProps = {
  className?: string;
  children: JSX.Element[] | JSX.Element;
  header?: JSX.Element;
  isFullWidth?: boolean;
};

function AppSideBar({
  className = "",
  children,
  header,
  isFullWidth,
}: BarProps) {
  const { pathname } = useLocation();
  const prevPathname = useRef<string | null>(pathname);

  const [showBar, setShowBar] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({});

  const wrapperRef = useRef<HTMLDivElement>(null);

  const hideBar = () => {
    setShowBar(() => false);
    setWrapperStyle({ backgroundColor: "transparent", left: 0 });
    setStyle(() => ({ left: "-100%" }));
    setTimeout(() => {
      setWrapperStyle({ left: "-100%" });
    }, 200);
  };

  const handleToggle = (e: MouseEvent) => {
    if (showBar) {
      const paths = e.composedPath();
      const show =
        paths.findIndex((el) => (el as any).id === CONSTS.ids.appSideBar) !==
        -1;
      if (!show) hideBar();
    }
  };
  const handleBarAction = () => {
    setWrapperStyle({ left: 0 });
    setStyle({ left: 0 });
    setShowBar(true);
  };

  useEffect(() => {
    return () => {
      setWrapperStyle({});
      setShowBar(false);
      setStyle(() => ({}));
    };
  }, []);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      if (showBar) hideBar();
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener("click", handleToggle);
    }
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener("click", handleToggle);
      }
    };
  }, [wrapperRef.current, style]);

  return (
    <div className={`${Styles.bar_wrapper} ${className}`}>
      {header ? (
        <div onClick={handleBarAction}>{header}</div>
      ) : (
        <SideBarIcon className={Styles.icon} onClick={handleBarAction} />
      )}
      <div className={Styles.content} style={wrapperStyle} ref={wrapperRef}>
        <div
          className={`${Styles.bar} ${isFullWidth ? Styles.full_width : ""}`}
          style={style}
          id={CONSTS.ids.appSideBar}
        >
          {isFullWidth ? (
            <div className={Styles.back} onClick={hideBar}>
              <IoArrowBack />
              {header}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppSideBar;
