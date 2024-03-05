import React, {
  useState,
  useRef,
  useEffect,
  CSSProperties,
  useMemo,
} from "react";
import Styles from "./sidebar.module.scss";
import { ReactComponent as CategoryIcon } from "../../../../../images/icons/category.svg";
import { HiBars3BottomLeft as SideBarIcon } from "react-icons/hi2";
import { CONSTS } from "../../../../../const";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";
import DropdownItem, {
  DropdownItemProps,
} from "../../../Dropdown/DropdownItem/DropdownItem";
import uniqId from "uniqid";
import UserAvatar from "../../UserAvatar/UserAvatar";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import userReq from "../../../../../requests/user";
import userSlice from "../../../../../store/userState";
import { useNavigate } from "react-router-dom";
import { Roles } from "../../../../../types/user";
import Dropdown from "../../../Dropdown/Dropdown";
type BarProps = {
  className?: string;
};

function AppSideBar({ className = "" }: BarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const headerDropDown = useAppSelector((state) => state.app.headerDropDown);
  const { resetUserState } = userSlice.actions;

  const [showBar, setShowBar] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const [wrapperStyle, setWrapperStyle] = useState<CSSProperties>({});

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: MouseEvent) => {
    if (showBar) {
      const paths = e.composedPath();
      const show =
        paths.findIndex((el) => (el as any).id === CONSTS.ids.appSideBar) !==
        -1;
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

  const handleSignOut = async () => {
    await userReq.signOut();
    dispatch(resetUserState());
    navigate("/signin", { replace: false });
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
      <SideBarIcon className={Styles.icon} onClick={handleBarAction} />
      <div className={Styles.content} style={wrapperStyle} ref={wrapperRef}>
        <div className={Styles.bar} style={style} id={CONSTS.ids.appSideBar}>
          <Dropdown
            wrapperClassName={Styles.dropdown}
            listClassName={Styles.items}
            titleClassName={Styles.avatar}
            showToolTip={false}
            listOnHover={false}
            title={
              <div className={Styles.avatar_inner}>
                <UserAvatar size={55} showInfo />
              </div>
            }
            items={headerDropDown}
            listOnLoad
          />
        </div>
      </div>
    </div>
  );
}

export default AppSideBar;
