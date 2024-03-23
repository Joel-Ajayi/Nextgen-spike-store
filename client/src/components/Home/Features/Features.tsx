import React from "react";
import Styles from "./Styles.module.scss";
import { TbTruckDelivery } from "react-icons/tb";
import { RiSecurePaymentFill } from "react-icons/ri";
import { RiRefund2Line } from "react-icons/ri";

function Features() {
  return (
    <div className={Styles.features}>
      <div className={Styles.feature}>
        <TbTruckDelivery />
        <div className={Styles.tagline}>
          <div className={Styles.header}>Fast Delivery</div>
          <div className={Styles.slogan}>Always On Time</div>
        </div>
      </div>
      <div className={Styles.feature}>
        <RiRefund2Line />
        <div className={Styles.tagline}>
          <div className={Styles.header}>10 Days Return</div>
          <div className={Styles.slogan}>If goods have problem</div>
        </div>
      </div>
      <div className={Styles.feature}>
        <RiSecurePaymentFill />
        <div className={Styles.tagline}>
          <div className={Styles.header}>Secure Payment</div>
          <div className={Styles.slogan}>100% Secure Payments</div>
        </div>
      </div>
    </div>
  );
}

export default Features;
