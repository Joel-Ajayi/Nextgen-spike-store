import React, { useEffect, useMemo } from "react";
import Styles from "./header.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProductsSearch from "../../Search/ProductsSearch/ProductsSearch";
import Dropdown, { DropdownProps } from "../../Dropdown/Dropdown";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";
import { MdOutlineEmail as MailsIcon } from "react-icons/md";
import { MdFavoriteBorder as FavoriteIcon } from "react-icons/md";
import { BiSolidCategory as CategoryIcon } from "react-icons/bi";
import { IoSearch as SearchIcon } from "react-icons/io5";
import { PiUsersLight as UsersIcon } from "react-icons/pi";
import { ReactComponent as LogoutIcon } from "../../../../images/icons/logout.svg";
import { BsBox as ProductIcon } from "react-icons/bs";
import { FiSettings as SettingsIcon } from "react-icons/fi";
import { IoMdTrendingUp as Trending } from "react-icons/io";
import { ReactComponent as QuestionIcon } from "../../../../images/icons/question-mark.svg";
import { MdOutlineLocalOffer as OfferIcon } from "react-icons/md";
import uniqId from "uniqid";
import appSlice from "../../../../store/appState";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import AppSideBar from "./AppSideBar/AppSideBar";
import userReq from "../../../../requests/user";
import userSlice from "../../../../store/userState";
import { Roles } from "../../../../types/user";

export const signOutItem = (logoutFunc?: () => void) =>
  ({
    icon: <LogoutIcon />,
    title: "Logout",
    onClick: logoutFunc,
  } as DropdownProps);

export const authItems = {
  title: "Account",
  items: [
    {
      icon: <SettingsIcon />,
      title: "Account Settings",
      link: () => "/profile",
    },
    { icon: <CartIcon />, title: "Orders", link: () => "/profile?dir=ord" },
    {
      icon: <MailsIcon />,
      title: "Notifications",
      link: () => "/profile?dir=ord",
    },
    {
      icon: <FavoriteIcon />,
      title: "WhishList",
      link: () => "/profile?dir=ord",
    },
  ],
} as DropdownProps;

export const controllerItems = (roles: Roles[]) =>
  ({
    title: "Controller",
    items: [
      (roles.includes(Roles.CategoryAndBrand) ||
        roles.includes(Roles.Global)) && {
        icon: <CategoryIcon />,
        title: "Categories",
        link: () => "/profile",
      },
      (roles.includes(Roles.Order) || roles.includes(Roles.Global)) && {
        icon: <CartIcon />,
        title: "Orders",
        link: () => "/profile?dir=ord",
      },
      (roles.includes(Roles.Product) || roles.includes(Roles.Global)) && {
        icon: <ProductIcon />,
        title: "Products",
        link: () => "/profile?dir=ord",
      },
      (roles.includes(Roles.SuperAdmin) || roles.includes(Roles.Global)) && {
        icon: <UsersIcon />,
        title: "Users",
        link: () => "/profile?dir=ord",
      },
    ],
  } as DropdownProps);

export const moreDropdown = {
  item: "",
  items: [
    {
      icon: <Trending />,
      title: "Trending Products",
      link: () => "/#",
    },
    {
      icon: <OfferIcon />,
      title: "Special Offers",
      link: () => "/#",
    },
    {
      icon: <QuestionIcon />,
      title: "Customer Services",
      link: () => "/#",
    },
  ],
} as DropdownProps;

export const notAuthItem = {
  title: "",
  items: [
    {
      title: "Already Signed Up? Log In!",
      link: () => "/#",
    },
    {
      icon: <QuestionIcon />,
      title: "New Customer? Sign Up!",
      link: () => "/#",
    },
  ],
} as DropdownProps;

function Header() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector((state) => state.app.isLoading);
  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const categories = useAppSelector(
    (state) => state.app.landingPageData.categories
  );

  const actions = appSlice.actions;
  const { resetUserState } = userSlice.actions;

  const handleSignInButton = () => {
    if (!isAuthenticated) {
      if (!pathname.includes("/signin")) {
        dispatch(actions.setShowModal(true));
      }
    }
  };

  const handleSignOut = async () => {
    await userReq.signOut();
    dispatch(resetUserState());
    navigate("/signin", { replace: false });
  };

  const headerDropDoown: DropdownProps[] = useMemo(() => {
    if (isLoading) return [];
    return isAuthenticated
      ? [
          { ...authItems, showTitle: false },
          { ...controllerItems(roles), showTitle: false },
          moreDropdown,
          signOutItem(handleSignOut),
        ]
      : [notAuthItem, moreDropdown, signOutItem(handleSignOut)];
  }, [isAuthenticated, isLoading]);

  const categoryTree = useMemo(
    () =>
      (function getChildren(parent = "", lvl = 0): DropdownProps[] {
        return categories
          .filter((c) => c.parent === parent)
          .map((c) => ({
            title: c.name,
            items: getChildren(c.name, lvl + 1),
          }));
      })(),
    [categories.length]
  );

  return (
    <>
      <div className={Styles.headerWrapper}>
        <div className={Styles.main_header}>
          <Link to="#" className={Styles.flipkartpluswrapper_tab}>
            <div className={Styles.logoname}>
              <i>
                <span>
                  <img src="/uploads/logo.svg" alt="logo" />
                  extGenSpike
                </span>
              </i>
            </div>
          </Link>

          <ProductsSearch className={Styles.search_bar} />
          <div className={Styles.other_items}>
            <div>
              <Dropdown
                wrapperClassName={Styles.dropdown}
                onClick={handleSignInButton}
                title={<UserAvatar size={35} isLink={false} />}
                items={headerDropDoown}
                align="c"
              />
            </div>
            <Link to="#" className={Styles.tab}>
              <SearchIcon className={Styles.icon} />
            </Link>
            <Link to="#" className={Styles.tab}>
              <MailsIcon className={Styles.icon} />
              <span>Mails</span>
            </Link>
            <Link to="#" className={Styles.tab}>
              <FavoriteIcon className={Styles.icon} />
              <span>Whishlist</span>
            </Link>
            <Link to="#" className={Styles.tab}>
              <CartIcon className={Styles.icon} />
              <span>Cart</span>
            </Link>
            <AppSideBar className={Styles.side_bar} />
          </div>
        </div>

        <div className={Styles.sub_header}>
          <Dropdown
            title={
              <div className={Styles.category_inner}>
                <CategoryIcon className={Styles.icon} />
                <span>Categories</span>
              </div>
            }
            titleClassName={Styles.category}
            childPos="m-r"
            align="r"
            items={categoryTree}
          />

          <div className={Styles.others}>
            <Link to="">Trending Products</Link>
            <Link to="">Special Offers</Link>
            <Link to="">Customer Services</Link>
          </div>
        </div>
      </div>
    </>
  );
}

const header = React.memo(Header);
export default header;
