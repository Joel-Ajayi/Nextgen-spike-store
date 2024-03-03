import React, { useEffect, useMemo } from "react";
import Styles from "./header.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProductsSearch from "../../Search/ProductsSearch/ProductsSearch";
import Dropdown from "../../Dropdown/Dropdown";
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
import DropdownItem, {
  DropdownItemProps,
} from "../../Dropdown/DropdownItem/DropdownItem";
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
  } as DropdownItemProps);

export const authItems = [
  { icon: <SettingsIcon />, title: "Account Settings", link: () => "/profile" },
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
] as DropdownItemProps[];

export const controllerItems = (roles: Roles[]) =>
  [
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
  ] as DropdownItemProps[];

export const moreDropdown = [
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
] as DropdownItemProps[];

export const notAuthItem = [
  {
    title: "Already Signed Up? Log In!",
    link: () => "/#",
  },
  {
    icon: <QuestionIcon />,
    title: "New Customer? Sign Up!",
    link: () => "/#",
  },
] as DropdownItemProps[];

function Header() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const headerDropDown = useAppSelector((state) => state.app.headerDropDown);
  const setHeaderDropDown = appSlice.actions.setHeaderDropDown;

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

  useEffect(() => {
    const dropDownItems = isAuthenticated
      ? [
          authItems,
          controllerItems(roles),
          moreDropdown,
          [signOutItem(handleSignOut)],
        ]
      : [notAuthItem, moreDropdown, [signOutItem(handleSignOut)]];

    dispatch(setHeaderDropDown(dropDownItems));
  }, [isAuthenticated]);

  const dropDown = useMemo(
    () =>
      headerDropDown.map((item) => (
        <div className={Styles.sub_dropdown}>
          {item.map((child) => (
            <DropdownItem
              key={uniqId()}
              title={child.title}
              icon={child.icon}
              link={child.link}
              onClick={child?.onClick}
              highlight
            />
          ))}
        </div>
      )),
    [headerDropDown]
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
            <Dropdown
              wrapperClassName={Styles.dropdown}
              onClick={handleSignInButton}
              title={<UserAvatar size={35} isLink={false} />}
              position="r"
              showCaret={false}
              items={dropDown}
            />
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
          <Link to="" className={Styles.category}>
            <CategoryIcon className={Styles.icon} />
            <span>Categories</span>
          </Link>
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
