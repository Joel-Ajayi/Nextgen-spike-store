import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { Roles } from "../../../../types";
import UserAvatar from "../UserAvatar/UserAvatar";
import Styles from "./styles.module.scss";
import Dropdown from "../../Dropdown/Dropdown";
import { Link } from "react-router-dom";
import userSlice from "../../../../store/userState";
import { Pages, PageSections } from "../../../../types/controller";

function ControllerHeader() {
  const { role } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const { resetUserState } = userSlice.actions;

  const signOut = () => {
    dispatch(resetUserState());
  };

  const catNavItems = [
    {
      title: "All Categories",
      link: `/controller?pg=${Pages.Categories}&sec=${PageSections.Listing}`,
    },
    {
      title: "Add Category",
      link: `/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}`,
    },
  ];

  const prdNavItems = [
    {
      title: "All Products",
      link: `/controller?pg=${Pages.Products}&sec=${PageSections.Listing}`,
    },
    {
      title: "Add Product",
      link: `/controller?pg=${Pages.Products}&sec=${PageSections.CreatePrd}`,
    },
  ];

  const brandNavItems = [
    {
      title: "All Brands",
      link: `/controller?pg=${Pages.Brand}&sec=${PageSections.Listing}`,
    },
    {
      title: "Add Brand",
      link: `/controller?pg=${Pages.Brand}&sec=${PageSections.CreatePrd}`,
    },
  ];

  const ordersNavItems = [
    {
      title: "Order Items",
      link: `/controller?pg=${Pages.Orders}&sec=${PageSections.Listing}`,
    },
  ];

  return (
    <div className={Styles.headerWrapper}>
      <div className={Styles.content}>
        <div className={Styles.logo}>
          <Link to="/">
            <img src="/uploads/logo.png" alt="logo" />
            <div>
              <i>Controller</i>
            </div>
          </Link>
        </div>
        {role === Roles.SuperAdmin && (
          <Dropdown
            wrapperClassName={Styles.nav_item}
            listClassName={Styles.nav_item_dropdown}
            title="Categories"
            showCaret
            showToolTip={false}
            items={catNavItems}
            level={1}
          />
        )}
        {role === Roles.SuperAdmin && (
          <Dropdown
            wrapperClassName={Styles.nav_item}
            listClassName={Styles.nav_item_dropdown}
            title="Brand"
            showCaret
            showToolTip={false}
            items={brandNavItems}
            level={1}
          />
        )}
        <Dropdown
          wrapperClassName={Styles.nav_item}
          listClassName={Styles.nav_item_dropdown}
          title="Products"
          showCaret
          showToolTip={false}
          items={prdNavItems}
          level={1}
        />
        <Dropdown
          wrapperClassName={Styles.nav_item}
          listClassName={Styles.nav_item_dropdown}
          title="Orders"
          showCaret
          showToolTip={false}
          items={ordersNavItems}
          level={1}
        />
        <div>
          <UserAvatar infoClassName={Styles.nav_avatar} />
        </div>
        <div className={Styles.nav_item} onClick={signOut}>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default ControllerHeader;
