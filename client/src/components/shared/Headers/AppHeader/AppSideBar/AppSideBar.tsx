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
import Dropdown, { DropdownProps } from "../../../Dropdown/Dropdown";
import {
  authItems,
  controllerItems,
  moreDropdown,
  notAuthItem,
  signOutItem,
} from "../Header";
type BarProps = {
  className?: string;
};

function AppSideBar({ className = "" }: BarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const { categories, topCategories } = useAppSelector(
    (state) => state.app.landingPageData
  );
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

  const getCategoryChildren = (parent = ""): DropdownProps[] => {
    return categories
      .filter((c) => c.parent === parent)
      .map((c) => ({
        title: c.name,
        items: getCategoryChildren(c.name),
        pos: "r-m",
      }));
  };

  const headerDropDoown: DropdownProps[] = useMemo(() => {
    return isAuthenticated
      ? [
          { ...authItems },
          {
            title: "Top Categories",
            items: [
              ...topCategories
                .filter((c, i) => !!c && i < 5)
                .map((c) => ({ title: c?.name })),
              {
                title: "All Categories",
                items: getCategoryChildren(),
                childPos: "r-m",
              },
            ],
          },
          controllerItems(roles),
          moreDropdown,
          signOutItem(handleSignOut),
        ]
      : [notAuthItem, moreDropdown];
  }, [isAuthenticated, topCategories, categories]);

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
            pos="m"
            items={headerDropDoown}
            listOnLoad
          />
        </div>
      </div>
    </div>
  );
}

export default AppSideBar;
