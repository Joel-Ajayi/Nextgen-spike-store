import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  CSSProperties,
} from "react";
import Styles from "./sidebar.module.scss";
import { ReactComponent as SideBarIcon } from "../../../../images/icons/sideBar.svg";
import { ReactComponent as CategoryIcon } from "../../../../images/icons/category.svg";
import { CONSTS } from "../../../../const";
import { loginDropdown, moreDropdown } from "../../Headers/AppHeader/Header";
import DropdownItem, {
  DropdownItemProps,
} from "../../Dropdown/DropdownItem/DropdownItem";
import uniqId from "uniqid";
import UserAvatar from "../../Headers/UserAvatar/UserAvatar";
import { useAppSelector } from "../../../../store/hooks";

type BarProps = {
  className?: string;
};

function AppSideBar({ className = "" }: BarProps) {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const [showBar, setShowBar] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({});

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: MouseEvent) => {
    if (showBar) {
      const show =
        ((e as any).composedPath() as EventTarget[]).findIndex(
          (el) => (el as any).id === CONSTS.ids.appSideBar
        ) !== -1;
      if (!show) {
        setShowBar(() => show);
        setWrapperStyle({ backgroundColor: "transparent", left: 0 });
        setStyle(() => ({ left: "-100%" }));
        setTimeout(() => {
          setWrapperStyle({ left: "-100%" });
        }, 200);
      }
    }
  };

  useEffect(() => {
    return () => {
      setWrapperStyle({});
      setShowBar(false);
      setStyle(() => ({}));
    };
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener("click", handleToggle);
    }
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener("click", handleToggle);
      }
    };
  }, [wrapperRef.current, style, setStyle]);

  return (
    <div className={`${Styles.bar_wrapper} ${className}`}>
      <SideBarIcon
        className={Styles.icon}
        onClick={() => {
          setWrapperStyle({ left: 0 });
          setStyle({ left: 0 });
          setShowBar(true);
        }}
      />
      <div className={Styles.content} style={wrapperStyle} ref={wrapperRef}>
        <div className={Styles.bar} style={style} id={CONSTS.ids.appSideBar}>
          <section>
            <UserAvatar />
          </section>
          <section>
            <ul>
              {loginDropdown(isAuthenticated as boolean).map((item) => (
                <DropdownItem
                  key={uniqId()}
                  title={(item as DropdownItemProps).title}
                  icon={(item as DropdownItemProps).icon}
                  link={(item as DropdownItemProps).link}
                />
              ))}
            </ul>
          </section>
          <section>
            <ul>
              <DropdownItem
                title="All Categories"
                icon={
                  <CategoryIcon
                    className="svg-brand-fill"
                    style={{
                      transform: "scale(0.9)",
                      width: 24,
                      margin: "0 12px",
                    }}
                  />
                }
                link="/categories"
              />
            </ul>
          </section>
          <section>
            <ul>
              {moreDropdown.map((item) => (
                <DropdownItem
                  key={uniqId()}
                  title={(item as DropdownItemProps).title}
                  icon={(item as DropdownItemProps).icon}
                  link={(item as DropdownItemProps).link}
                />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AppSideBar;
