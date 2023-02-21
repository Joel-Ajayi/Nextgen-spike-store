import React, { useMemo } from "react";
import Styles from "./header.module.scss";
import { Link, useLocation } from "react-router-dom";
import ProductsSearch from "../../Search/ProductsSearch/ProductsSearch";
import Dropdown, { DropdownProps } from "../../Dropdown/Dropdown";
import { ReactComponent as ProfileIcon } from "../../../../images/icons/account.svg";
import { ReactComponent as AdminIcon } from "../../../../images/icons/admin.svg";
import { ReactComponent as CartIcon } from "../../../../images/icons/cart.svg";
import { ReactComponent as FavoriteIcon } from "../../../../images/icons/favorite.svg";
import { ReactComponent as NotificationIcon } from "../../../../images/icons/notifications.svg";
import { ReactComponent as QuestionIcon } from "../../../../images/icons/question-mark.svg";
import { ReactComponent as DownloadIcon } from "../../../../images/icons/download.svg";
import { ReactComponent as GrowthIcon } from "../../../../images/icons/growth.svg";
import { ReactComponent as RewardIcon } from "../../../../images/icons/badge.svg";
import { ReactComponent as OrderIcon } from "../../../../images/icons/order.svg";
import { ReactComponent as GiftIcon } from "../../../../images/icons/gift-card.svg";
import { DropdownItemProps } from "../../Dropdown/DropdownItem/DropdownItem";
import uniqId from "uniqid";
import ModalWrapper from "../../Modal/Wrapper/Wrapper";
import UserLogin from "../../../SignIn/SignIn";
import appSlice from "../../../../store/appState";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import AppSideBar from "../../SideBars/AppSideBar/AppSideBar";

export const loginDropdown = (isAuthenticated: boolean) => {
  return [
    {
      icon: (
        <ProfileIcon
          className="svg-brand"
          style={{ transform: "scale(0.45)" }}
        />
      ),
      title: "My Profile",
      link: "/profile",
    },
    isAuthenticated
      ? {
          icon: (
            <AdminIcon
              className="svg-brand"
              style={{ transform: "scale(0.45)", width: 48 }}
            />
          ),
          title: "Controller",
          link: "/controller",
        }
      : null,
    {
      icon: (
        <OrderIcon
          className="svg-brand-fill"
          style={{ transform: "scale(0.36)", width: 48 }}
        />
      ),
      title: "Orders",
      link: "/profile?dir=ord",
    },
    {
      icon: (
        <FavoriteIcon
          className="svg-brand"
          style={{ transform: "scale(0.4)" }}
        />
      ),
      title: "Whishlist",
      link: "/#",
    },
    {
      icon: (
        <RewardIcon
          className="svg-brand-fill"
          style={{ transform: "scale(0.9)", margin: "0 12px" }}
        />
      ),
      title: "Rewards",
      link: "/#",
    },
    {
      icon: (
        <GiftIcon
          className="svg-brand-fill"
          style={{ transform: "scale(0.9)", width: 24, margin: "0 12px" }}
        />
      ),
      title: "Gift cards",
      link: "/#",
    },
  ] as (DropdownProps | DropdownItemProps)[];
};

export const moreDropdown = [
  {
    icon: (
      <NotificationIcon
        className="svg-brand"
        style={{ transform: "scale(0.8)", margin: "0 12" }}
      />
    ),
    title: "Notification Perferences",
    link: "/#",
  },
  {
    icon: (
      <QuestionIcon
        className="svg-brand-fill"
        style={{ transform: "scale(0.32)" }}
      />
    ),
    title: "24x7 Customer Care",
    link: "/#",
  },
  {
    icon: (
      <GrowthIcon
        className="svg-brand"
        style={{ transform: "scale(0.45)", width: 48 }}
      />
    ),
    title: "Advertise",
    link: "/#",
  },
  {
    icon: (
      <DownloadIcon
        className="svg-brand"
        style={{ transform: "scale(0.45)" }}
      />
    ),
    title: "Download App",
    link: "/#",
  },
] as (DropdownProps | DropdownItemProps)[];

function Header() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  const actions = appSlice.actions;

  const handleSignInButton = () => {
    if (!isAuthenticated) {
      if (!pathname.includes("/signin")) {
        dispatch(actions.setShowModal(true));
      }
    }
  };

  const loginItemsDropdown = useMemo(() => {
    if (!isAuthenticated) {
      return [
        <div className={Styles.signup_item} key={uniqId()}>
          <div>New Customer ?</div>
          <Link to="/?signup=true" onClick={handleSignInButton}>
            Sign Up
          </Link>
        </div>,
        ...loginDropdown(false),
      ];
    }
    return loginDropdown(true);
  }, [isAuthenticated]);

  return (
    <>
      <ModalWrapper>
        <UserLogin />
      </ModalWrapper>
      <div className={Styles.headerWrapper}>
        <div className={Styles.content}>
          <AppSideBar className={Styles.side_bar} />
          <Link to="#" className={Styles.flipkartpluswrapper_tab}>
            <div className={Styles.logoname}>
              <i>Flipkart</i>
            </div>
            <div className={Styles.plus}>
              <span>
                <i>Explore</i>
              </span>
              <span>
                <span>
                  <i>Plus</i>
                </span>
                <img
                  src="/uploads/plus_icon.png"
                  alt="flipkart-plus-icon"
                  width={10}
                  height={10}
                />
              </span>
            </div>
          </Link>
          <ProductsSearch className={Styles.search_bar} />
          <Dropdown
            wrapperClassName={Styles.user_dropdown}
            onClick={handleSignInButton}
            title={isAuthenticated ? <UserAvatar /> : <span>Login</span>}
            listClassName={Styles.user_dropdown_list}
            titleClassName={!isAuthenticated ? Styles.login_button : ""}
            showCaret={false}
            items={loginItemsDropdown}
            level={1}
          />
          <Dropdown
            wrapperClassName={Styles.more_dropdown}
            title={<span>More</span>}
            level={1}
            items={moreDropdown}
          />
          <Link to="#" className={Styles.cart_tab}>
            <CartIcon className={Styles.cart_icon} />
            <span>Cart</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;
