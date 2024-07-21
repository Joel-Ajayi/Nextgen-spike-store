import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import Styles from "./styles.module.scss";
import Dropdown, { DropdownProps } from "../../Dropdown/Dropdown";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import userSlice from "../../../../store/userState";
import { ControllerPaths } from "../../../../types/controller";
import userReq from "../../../../requests/user";
import { authItems, controllerItems, signOutItem } from "../AppHeader/Header";
import uniqId from "uniqid";
import appSlice from "../../../../store/appState";
import controllerStateSlice from "../../../../store/controller/states";
import navData, { DataType } from "./data";
import data from "./data";
import AppSideBar from "../AppSideBar/AppSideBar";

function ControllerHeader() {
  let [params] = useSearchParams();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resetUserState } = userSlice.actions;
  const { setShowModal } = appSlice.actions;
  const { setActiveTabs } = controllerStateSlice.actions;

  const tab = params.get("sub");

  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const activeTabs = useAppSelector(
    (state) => state.controller.state.activeTabs
  );

  useEffect(() => {
    if (tab && !activeTabs.includes(tab)) {
      const tabPath: string[] = [];

      // (function findPath(data: { [x: string]: DataType }, path: string[]) {
      //   Object.keys(data).forEach((dataKey) => {
      //     if (dataKey !== tab) {
      //       findPath(data[dataKey].items, [...path, dataKey]);
      //       return;
      //     }
      //     tabPath.push(...path, dataKey);
      //   });
      // })(data, []);
      // dispatch(setActiveTabs(tabPath));
    }
  }, [tab]);

  const handleSignOut = async () => {
    await userReq.signOut();
    dispatch(resetUserState());
    navigate("/signin", { replace: false });
    dispatch(resetUserState());
  };

  const handleSignInButton = () => {
    if (!isAuthenticated) {
      if (!pathname.includes("/signin")) {
        dispatch(setShowModal(true));
      }
    }
  };

  const loginItemsDropdown = useMemo(() => {
    if (isAuthenticated) return authItems;
    return [
      <div className={Styles.signup_item} key={uniqId()}>
        <div>New Customer ?</div>
        <Link to={`${pathname}?signup=true`} onClick={handleSignInButton}>
          Sign Up
        </Link>
      </div>,
    ];
  }, [isAuthenticated]);

  const userDropDoown: DropdownProps[] = useMemo(
    () => [{ ...authItems, showTitle: false }, signOutItem(handleSignOut)],
    []
  );

  return (
    <div className={Styles.headerWrapper}>
      <div className={Styles.content}>
        <div className={Styles.logo}>
          <Link to="/">
            <img src="/uploads/logo.svg" alt="logo" />
            <i>Controller</i>
          </Link>
        </div>

        {navData.map((tab) => {
          return (
            <Dropdown
              key={uniqId()}
              wrapperClassName={Styles.dropdown}
              titleClassName={Styles.nav_tab}
              title={tab.title}
              items={tab.items}
              link={tab.items?.length ? undefined : tab?.link}
              listOnHover
              childPos="t-m"
              align="c"
            />
          );
        })}

        <Dropdown
          wrapperClassName={Styles.dropdown}
          titleClassName={Styles.nav_tab}
          onClick={handleSignInButton}
          title={<UserAvatar size={35} isLink={false} />}
          items={userDropDoown}
          listOnHover
          align="c"
        />

        <AppSideBar className={Styles.side_bar} />
      </div>
    </div>
  );
}

export default ControllerHeader;
