import React, { useEffect, useMemo } from "react";
import Styles from "./header.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown, { DropdownProps } from "../../Dropdown/Dropdown";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";
import { MdOutlineEmail as MailsIcon } from "react-icons/md";
import { MdFavoriteBorder as FavoriteIcon } from "react-icons/md";
import { BiSolidCategory as CategoryIcon } from "react-icons/bi";
import { FaBoxOpen as ProductIcon } from "react-icons/fa";
import { ReactComponent as LogoutIcon } from "../../../../images/icons/logout.svg";
import { FiSettings as SettingsIcon } from "react-icons/fi";
import { IoMdTrendingUp as Trending } from "react-icons/io";
import { ReactComponent as QuestionIcon } from "../../../../images/icons/question-mark.svg";
import { MdOutlineLocalOffer as OfferIcon } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import appSlice from "../../../../store/appState";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import AppSideBar from "../AppSideBar/AppSideBar";
import userReq from "../../../../requests/user";
import userSlice from "../../../../store/userState";
import { Roles } from "../../../../types/user";
import { PageSections, ControllerPaths } from "../../../../types/controller";
import { UserPaths } from "../../../../types/user";
import { Paths } from "../../../../types";
import globalReq from "../../../../requests/global";
import ProductsSearch from "../../Input/ProductsSearch/ProductsSearch";

export const authItems = {
  title: "",
  items: [
    {
      icon: <SettingsIcon />,
      title: "Account Settings",
      link: () => `/profile`,
    },
    {
      icon: <CartIcon />,
      title: "Orders",
      link: () => `/profile?pg=${UserPaths.Orders}`,
    },
    {
      icon: <MailsIcon />,
      title: "Notifications",
      link: () => `/profile?pg=${UserPaths.Notifications}`,
    },
  ],
} as DropdownProps;

export const controllerItems = (roles: Roles[]) =>
  ({
    title: "Controller",
    items: [
      (roles.includes(Roles.SuperAdmin) || roles.includes(Roles.Global)) && {
        icon: <MdDashboard />,
        title: "Dashboard",
        link: () => `/${Paths.Controller}`,
      },
      (roles.includes(Roles.CategoryAndBrand) ||
        roles.includes(Roles.Global)) && {
        icon: <CategoryIcon />,
        title: "Categories",
        link: () =>
          `/${Paths.Controller}/${ControllerPaths.Categories}/${PageSections.CatListing}`,
      },
      (roles.includes(Roles.Order) || roles.includes(Roles.Global)) && {
        icon: <CartIcon />,
        title: "Orders",
        link: () => `/${Paths.Controller}/${ControllerPaths.Orders}`,
      },
      (roles.includes(Roles.Product) || roles.includes(Roles.Global)) && {
        icon: <ProductIcon />,
        title: "Products",
        link: () =>
          `/${Paths.Controller}/${ControllerPaths.Products}/${PageSections.PrdListing}`,
      },
      ,
    ],
  } as DropdownProps);

export const moreDropdown = {
  item: "",
  items: [
    {
      icon: <ProductIcon />,
      title: "Products",
      link: () => Paths.Products,
    },
    {
      icon: <Trending />,
      title: "Trending Products",
      link: () => Paths.Products,
    },
    {
      icon: <OfferIcon />,
      title: "Offers",
      link: () => Paths.Products,
    },
    {
      icon: <QuestionIcon />,
      title: "Customer Services",
      link: () => Paths.Products,
    },
  ],
} as DropdownProps;

export const signOutItem = (logoutFunc?: () => void) =>
  ({
    title: "",
    items: [
      ...(moreDropdown.items as DropdownProps[]),
      {
        icon: <LogoutIcon />,
        title: "Logout",
        onClick: logoutFunc,
      },
    ],
  } as DropdownProps);

export const notAuthItem = {
  title: "",
  items: [
    {
      title: "Already Signed Up? Log In!",
      link: () => "/signin",
    },
    {
      icon: <QuestionIcon />,
      title: "New Customer? Sign Up!",
      link: () => "/signin?signup=true",
    },
    ...(moreDropdown.items as DropdownProps[]),
  ],
} as DropdownProps;

export default function Header() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isProfile = pathname.includes("profile");

  const isLoading = useAppSelector((state) => state.app.isLoading);
  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const categories = useAppSelector((state) => state.app.headerData.categories);

  const actions = appSlice.actions;
  const resetUserState = userSlice.actions.resetUserState;
  const setHeaderData = appSlice.actions.setHeaderData;

  const handleSignInButton = () => {
    if (!isAuthenticated) {
      if (!pathname.includes("/signin")) {
        dispatch(actions.setShowModal(true));
      }
    }
  };

  useEffect(() => {
    if (!categories.length) {
      (async () => {
        const res = await globalReq.getHeaderData();
        dispatch(setHeaderData(res));
      })();
    }
  }, []);

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
          controllerItems(roles),
          signOutItem(handleSignOut),
        ]
      : [notAuthItem, moreDropdown];
  }, [isAuthenticated, isLoading]);

  const categoryTree = useMemo(
    () =>
      (function getChildren(parent = "", lvl = 0): DropdownProps[] {
        return categories
          .filter((c) => c.parent === parent)
          .map((c) => ({
            title: c.name,
            items: getChildren(c.name, lvl + 1),
            link: () => `/products/?cat=${c.name}`,
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
                showCaret={false}
              />
            </div>
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

        {!isProfile && (
          <div className={Styles.sub_header}>
            <div className={Styles.content}>
              <Dropdown
                title="Categories"
                icon={<CategoryIcon className={Styles.icon} />}
                titleClassName={Styles.category_inner}
                align="r"
                childPos="m-r"
                items={categoryTree}
              />

              <div className={Styles.others}>
                <Link to="">Trending Products</Link>
                <Link to="">Special Offers</Link>
                <Link to="">Customer Services</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
