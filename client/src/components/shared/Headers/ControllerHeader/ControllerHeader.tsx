import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import Styles from "./styles.module.scss";
import Dropdown from "../../Dropdown/Dropdown";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import userSlice from "../../../../store/userState";
import { Pages } from "../../../../types/controller";
import userReq from "../../../../requests/user";
import ControllerSideBar from "./ControllerSideBar/ControllerSideBar";
import { authItems } from "../AppHeader/Header";
import uniqId from "uniqid";
import appSlice from "../../../../store/appState";
import controllerStateSlice from "../../../../store/controller/states";
import navData, { DataType } from "./data";
import data from "./data";

function ControllerHeader() {
  let [params] = useSearchParams();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resetUserState } = userSlice.actions;
  const { setShowModal } = appSlice.actions;
  const { setActiveTabs } = controllerStateSlice.actions;

  const tab = params.get("sub");

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const activeTabs = useAppSelector(
    (state) => state.controller.state.activeTabs
  );

  useEffect(() => {
    if (tab && !activeTabs.includes(tab)) {
      const tabPath: string[] = [];

      (function findPath(data: { [x: string]: DataType }, path: string[]) {
        Object.keys(data).forEach((dataKey) => {
          if (dataKey !== tab) {
            findPath(data[dataKey].items, [...path, dataKey]);
            return;
          }
          tabPath.push(...path, dataKey);
        });
      })(data, []);
      dispatch(setActiveTabs(tabPath));
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

  return (
    <div className={Styles.headerWrapper}>
      <div className={Styles.content}>
        <div className={Styles.logo}>
          <Link to="/">
            <img src="/uploads/logo.svg" alt="logo" />
            <div>
              <i>Controller</i>
            </div>
          </Link>
        </div>

        {Object.values(Pages).map((page) => {
          if (page == Pages.DashBoard) return null;
          const hasItems = !!Object.keys(navData[page]).length;
          return (
            <Dropdown
              wrapperClassName={Styles.nav_item}
              key={uniqId()}
              listClassName={Styles.nav_item_dropdown}
              title={navData[page].title}
              showCaret
              onClick={hasItems ? () => {} : (null as any)}
              link={!hasItems ? navData[page].link() : ""}
              showToolTip={false}
              items={Object.values(navData[page].items)}
            />
          );
        })}

        <Dropdown
          wrapperClassName={Styles.nav_item}
          onClick={handleSignInButton}
          title={
            isAuthenticated ? (
              <UserAvatar isLink={false} infoClassName={Styles.nav_avatar} />
            ) : (
              <span>Login</span>
            )
          }
          listClassName={Styles.user_dropdown_list}
          titleClassName={!isAuthenticated ? Styles.login_button : ""}
          showCaret={false}
          // items={loginItemsDropdown}
          position="r"
        />
        <div className={Styles.side_bar}>
          <ControllerSideBar isFixed />
        </div>
      </div>
    </div>
  );
}

export default ControllerHeader;
