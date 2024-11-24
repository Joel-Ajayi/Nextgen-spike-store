import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import Styles from "./styles.module.scss";
import Dropdown, { DropdownProps } from "../../Dropdown/Dropdown";
import { Link, useLocation, useNavigate } from "react-router-dom";
import userSlice from "../../../../store/userState";
import userReq from "../../../../requests/user";
import { authItems, signOutItem } from "../AppHeader/Header";
import uniqId from "uniqid";
import appSlice from "../../../../store/appState";
import navData from "./data";
import data from "./data";
import AppSideBar from "../AppSideBar/AppSideBar";

function ControllerHeader() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resetUserState } = userSlice.actions;
  const { setShowModal } = appSlice.actions;

  const { isAuthenticated } = useAppSelector((state) => state.user);

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

  const userDropDoown: DropdownProps[] = useMemo(
    () => [{ ...authItems, showTitle: false }, signOutItem(handleSignOut)],
    []
  );

  const navs = useMemo(() => {
    return [
      authItems,
      { title: "Controller", items: data },
      signOutItem(handleSignOut),
    ].filter((item) => !!item) as DropdownProps[];
  }, [isAuthenticated]);

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
              showCaret={false}
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
          showCaret={false}
          align="l"
        />

        <AppSideBar className={Styles.side_bar}>
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
            showCaret={false}
            pos="m"
            items={navs}
            listOnLoad
          />
        </AppSideBar>
      </div>
    </div>
  );
}

export default ControllerHeader;
