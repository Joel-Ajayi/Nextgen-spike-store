import React from "react";
import Styles from "./modal.module.scss";
import CloseIcon from "../../images/icons/close.svg";

function Modal() {
  return (
    <div className={Styles.modal_wrapper}>
      <div></div>
      <CloseIcon />
    </div>
  );
}

export default Modal;
