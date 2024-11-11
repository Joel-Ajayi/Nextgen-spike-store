import React from "react";
import Styles from "./styles.module.scss";
import { useAppSelector } from "../../store/hooks";

function Details() {
  const details = useAppSelector((state) => state.product.description);
  return (
    <div className={Styles.tab}>
      <div className={Styles.header}>Details</div>
      <div className={Styles.tab_content}>
        <div className={Styles.details}>{details}</div>
      </div>
    </div>
  );
}

export default Details;
