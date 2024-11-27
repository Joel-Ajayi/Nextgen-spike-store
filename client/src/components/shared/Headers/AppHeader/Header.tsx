import React, { useEffect, useMemo, useRef } from "react";
import Styles from "./header.module.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown, { DropdownProps } from "../../Dropdown/Dropdown";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";
import { MdOutlineEmail as MailsIcon } from "react-icons/md";
import { MdFavoriteBorder as FavoriteIcon } from "react-icons/md";
import { BiSolidCategory as CategoryIcon } from "react-icons/bi";
import { FaBoxOpen as ProductIcon } from "react-icons/fa";
import { FaRegAddressCard } from "react-icons/fa";
import { MdOutlineBrandingWatermark } from "react-icons/md";
import { FiSettings as SettingsIcon } from "react-icons/fi";
import { IoMdTrendingUp as Trending } from "react-icons/io";
import { MdOutlineLocalOffer as OfferIcon } from "react-icons/md";
import appSlice from "../../../../store/appState";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import UserAvatar from "../UserAvatar/UserAvatar";
import AppSideBar from "../AppSideBar/AppSideBar";
import userReq from "../../../../requests/user";
import userSlice from "../../../../store/userState";
import { Roles } from "../../../../types/user";
import { PageSections, ControllerPaths } from "../../../../types/controller";
import { UserPaths } from "../../../../types/user";
import { CatalogQuery, Paths } from "../../../../types";
import globalReq from "../../../../requests/global";
import ProductsSearch from "../../Input/ProductsSearch/ProductsSearch";
import cartSlice from "../../../../store/cart";
import productReq from "../../../../requests/product";
import helpers from "../../../../helpers";
import { MdQuestionMark as QuestionIcon } from "react-icons/md";
import { FiLogOut as LogoutIcon } from "react-icons/fi";

export const authItems = {
  title: "",
  items: [
    {
      Icon: SettingsIcon,
      title: "Account Settings",
      link: () => `${Paths.Profile}/${UserPaths.Account}`,
    },
    {
      Icon: FaRegAddressCard,
      title: "Addresses",
      link: () => `${Paths.Profile}/${UserPaths.Addresses}`,
    },
    {
      Icon: CartIcon,
      title: "Orders",
      link: () => `${Paths.Profile}/${UserPaths.Orders}`,
    },
  ],
} as DropdownProps;

export const homeControllerItems = (roles: Roles[]) => {
  const items = [
    roles.includes(Roles.SuperAdmin) || roles.includes(Roles.Global)
      ? {
          Icon: MdOutlineBrandingWatermark,
          title: "Brands",
          link: () =>
            `${Paths.Controller}/${ControllerPaths.Brand}/${PageSections.BrdListing}`,
        }
      : null,
    roles.includes(Roles.CategoryAndBrand) || roles.includes(Roles.Global)
      ? {
          Icon: CategoryIcon,
          title: "Categories",
          link: () =>
            `${Paths.Controller}/${ControllerPaths.Categories}/${PageSections.CatListing}`,
        }
      : null,
    roles.includes(Roles.Order) || roles.includes(Roles.Global)
      ? {
          Icon: CartIcon,
          title: "Orders",
          link: () => `${Paths.Controller}/${ControllerPaths.Orders}`,
        }
      : null,
    roles.includes(Roles.Product) || roles.includes(Roles.Global)
      ? {
          Icon: ProductIcon,
          title: "Products",
          link: () =>
            `${Paths.Controller}/${ControllerPaths.Products}/${PageSections.PrdListing}`,
        }
      : null,
    ,
  ];

  return {
    title: items.includes(null) ? "" : "Controller",
    borderTop: true,
    items,
  } as DropdownProps;
};

export const moreDropdown = (isAuthenticated: boolean) =>
  ({
    item: "",
    items: [
      {
        Icon: ProductIcon,
        borderTop: isAuthenticated,
        title: "Products",
        link: () => Paths.Catalog,
      },
      {
        Icon: FavoriteIcon,
        title: "Whislist",
        link: () => Paths.WishList,
      },
      {
        Icon: Trending,
        title: "Trending Products",
        link: () => `${Paths.Catalog}?sort_by=popular`,
      },
      {
        Icon: OfferIcon,
        title: "Offers",
        link: () => Paths.Catalog,
      },
      {
        title: "Customer Services",
        link: () => Paths.Catalog,
      },
    ],
  } as DropdownProps);

export const signOutItem = (logoutFunc?: () => void) =>
  ({
    title: "",
    items: [
      ...(moreDropdown(true).items as DropdownProps[]),
      {
        Icon: LogoutIcon,
        title: "Logout",
        onClick: logoutFunc,
      },
    ],
  } as DropdownProps);

export const notAuthItem = {
  title: "",
  items: [
    ...(moreDropdown(false).items as DropdownProps[]),
    {
      title: "Already Signed Up? Log In!",
      link: () => "/signin",
    },
    {
      Icon: QuestionIcon,
      title: "New Customer? Sign Up!",
      link: () => "/signin?signup=true",
    },
  ],
} as DropdownProps;

export default function Header() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isProfile = pathname.includes("profile");
  const isCatalog = pathname.includes("catalog");
  const showSubHeader = !isProfile && !isCatalog;

  const isLoading = useAppSelector((state) => state.app.isLoading);
  const cartCount = useAppSelector((state) => state.cart.items.length);
  const isCartPreLoaded = useAppSelector((state) => !!state.cart.items[0]);
  const { isAuthenticated, roles } = useAppSelector((state) => state.user);
  const categories = useAppSelector((state) => state.app.headerData.categories);
  const topCategories = useAppSelector(
    (state) => state.app.headerData.topCategories
  );

  const isRendered = useRef(false);

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
    if (!isRendered.current) {
      isRendered.current = true;
      (async () => {
        if (!categories.length) {
          const res = await globalReq.getHeaderData();
          dispatch(setHeaderData(res));
        }

        //cart items
        const cartCount = helpers.getCart().length;
        if (cartCount) {
          if (!isCartPreLoaded) {
            const cartItems = await productReq.getCart();
            if (cartItems) {
              dispatch(cartSlice.actions.setCart(cartItems));
            }
          }
        }
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
          homeControllerItems(roles),
          signOutItem(handleSignOut),
        ]
      : [notAuthItem];
  }, [isAuthenticated, isLoading]);

  const categoryTree = useMemo(
    () =>
      showSubHeader
        ? (function getChildren(parent = "", lvl = 0): DropdownProps[] {
            return categories
              .filter((c) => c.parent === parent)
              .map((c) => ({
                title: c.name,
                items: getChildren(c.name, lvl + 1),
                link: () =>
                  `${Paths.Catalog}/?${CatalogQuery.Category}=${c.name}`,
              }));
          })()
        : [],
    [categories.length]
  );

  const getCategoryChildren = (parent = ""): DropdownProps[] => {
    return categories
      .filter((c) => c.parent === parent)
      .map((c) => ({
        title: c.name,
        items: getCategoryChildren(c.name),
        pos: "r-m",
        link: () => `${Paths.Catalog}/?${CatalogQuery.Category}=${c?.name}`,
      }));
  };
  const categoriesHomeDropDown = useMemo(
    () =>
      !isProfile && {
        title: "Top Categories",
        borderTop: true,
        items: [
          ...topCategories
            .filter((c, i) => !!c && i < 5)
            .map((c) => ({
              title: c?.name,
              link: () =>
                `${Paths.Catalog}/?${CatalogQuery.Category}=${c?.name}`,
            })),
          {
            title: "All Categories",
            items: getCategoryChildren(),
            childPos: "r-m",
          },
        ] as DropdownProps[],
      },
    [isProfile, topCategories, categories.length]
  );

  const controllerHomeDropdown = useMemo(
    () =>
      roles.length && {
        ...homeControllerItems(roles),
      },
    [isProfile, roles]
  );
  const navs = useMemo(() => {
    return (
      isAuthenticated
        ? [
            authItems,
            controllerHomeDropdown,
            categoriesHomeDropDown,
            signOutItem(handleSignOut),
          ]
        : [categoriesHomeDropDown, notAuthItem]
    ).filter((item) => !!item) as DropdownProps[];
  }, [isAuthenticated, categoriesHomeDropDown, controllerHomeDropdown]);

  return (
    <>
      <div className={Styles.headerWrapper}>
        <div
          className={`${Styles.main_header} ${
            showSubHeader ? Styles.show_sub_header : ""
          }`}
        >
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
              title={
                <UserAvatar size={showSubHeader ? 35 : 30} isLink={false} />
              }
              titleClassName={Styles.title}
              items={headerDropDoown}
              align="c"
              showCaret={false}
            />
            <Link to={Paths.WishList} className={Styles.whish}>
              <FavoriteIcon className={Styles.icon} />
              <span>Whishlist</span>
            </Link>
            <Link to={Paths.Cart} className={Styles.cart}>
              {!!cartCount && (
                <div className={Styles.cart_count}>{cartCount}</div>
              )}
              <CartIcon className={Styles.icon} />
              <span>Cart</span>
            </Link>

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

        {showSubHeader && (
          <div className={Styles.sub_header}>
            <div className={Styles.content}>
              <Dropdown
                title="Categories"
                Icon={CategoryIcon}
                titleClassName={Styles.category_inner}
                align="r"
                childPos="m-r"
                items={categoryTree}
              />

              <div className={Styles.others}>
                <a href="#trend">Trending Products</a>
                <a href="#special">Special Offers</a>
                <Link to="">Customer Services</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
