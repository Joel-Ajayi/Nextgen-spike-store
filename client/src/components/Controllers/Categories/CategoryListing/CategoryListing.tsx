import React from "react";
import { Pages, PageSections } from "../../../../types/controller";
import Button from "../../../shared/Button/Button";
import ControllerStyles from "../../controller.module.scss";
import Styles from "./catListing.module.scss";

function CategoryListing() {
  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.title}>Category Listings</div>
        <div>
          <Button
            value="ADD NEW CATEGORY"
            type="button"
            className={Styles.all_cat_button}
            link={`/controller?pg=${Pages.Categories}&sec=${PageSections.CreateCat}`}
          />
        </div>
      </div>
      <div className={Styles.content}></div>
    </div>
  );
}

export default CategoryListing;
