import React, { CSSProperties } from "react";
import Styles from "./header.module.scss";
import Link from "next/link";
import Cart from "../../images/icons/cart.svg";
import ProductsSearch from "../Search/ProductsSearch/ProductsSearch";
import Dropdown, { DropdownProps } from "../Dropdown/Dropdown";
import ProfileIcon from "../../images/icons/account.svg";
import FavoriteIcon from "../../images/icons/favorite.svg";
import NotificationIcon from "../../images/icons/notifications.svg";
import QuestionIcon from "../../images/icons/question-mark.svg";
import DownloadIcon from "../../images/icons/download.svg";
import GrowthIcon from "../../images/icons/growth.svg";
import RewardIcon from "../../images/icons/badge.svg";
import OrderIcon from "../../images/icons/order.svg";
import GiftIcon from "../../images/icons/gift-card.svg";
import { DropdownItemProps } from "../Dropdown/DropdownItem/DropdownItem";

function Header() {
  const handleLoginButton = () => {};

  const loginDropdown = [
    <div className={Styles.signup_item}>
      <div>New Customer ?</div>
      <Link href="/#">Sign Up</Link>
    </div>,
    {
      icon: (
        <ProfileIcon
          className="svg-brand"
          style={{ transform: "scale(0.45)" }}
        />
      ),
      title: "My Profile",
      link: "/#",
    },
    {
      icon: (
        <OrderIcon
          className="svg-brand-fill"
          style={{ transform: "scale(0.36)", width: 48 }}
        />
      ),
      title: "Orders",
      link: "/#",
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
  ] as (JSX.Element | DropdownProps | DropdownItemProps)[];

  const moreDropdown = [
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
  ] as (JSX.Element | DropdownProps | DropdownItemProps)[];

  return (
    <div className={Styles.headerWrapper}>
      <div className={Styles.content}>
        <Link href="#" className={Styles.flipkartpluswrapper_tab}>
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
                src="https://res.cloudinary.com/dbmumpbin/image/upload/v1669970819/Flipkart/plus_icon.png"
                alt="flipkart-plus-icon"
                width={10}
                height={10}
              />
            </span>
          </div>
        </Link>
        <ProductsSearch />
        <Dropdown
          wrapperClassName={Styles.dropdown_wrapper}
          onClick={handleLoginButton}
          title="Login"
          titleClassName={Styles.login_button}
          showCaret={false}
          items={loginDropdown}
          level={1}
        />
        <Link href="#" className={Styles.seller_tab}>
          <span>Become a seller</span>
        </Link>
        <Dropdown
          wrapperClassName={Styles.dropdown_wrapper}
          title="More"
          listOnHover
          level={1}
          items={moreDropdown}
        />
        <Link href="#" className={Styles.cart_tab}>
          <Cart className={Styles.cart_icon} />
          <span>Cart</span>
        </Link>
      </div>
    </div>
  );
}

export default Header;
