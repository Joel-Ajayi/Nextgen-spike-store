import React, { useMemo } from "react";
import Styles from "./styles.module.scss";
import { TbTruckDelivery } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";
import { IoLocationOutline } from "react-icons/io5";
import { TbCurrencyNaira } from "react-icons/tb";

function Delivery() {
  const date = useMemo(() => {
    const today = new Date();
    const next = new Date();
    next.setDate(today.getDate() + 6);

    return (
      <>
        <b>{today.toDateString()}</b> & <b>{next.toDateString()}</b>
      </>
    );
  }, []);
  return (
    <div className={Styles.tab}>
      <div className={Styles.header}>Delivery & Returns</div>
      <div className={Styles.tab_content}>
        <div className={Styles.delivery}>
          <div className={Styles.sec}>
            <IoLocationOutline />
            <div>
              <div className={Styles.header}>Location</div>
              <div className={Styles.note}>
                Delivery Only Within Akure, Ondo State, Nigeria.
              </div>
            </div>
          </div>
          <div className={Styles.sec}>
            <TbTruckDelivery />
            <div>
              <div className={Styles.header}>Door Delivery</div>
              <div className={Styles.note}>
                Delivery Fee{" "}
                <b>
                  <TbCurrencyNaira />
                  1000
                </b>
              </div>
              <div className={Styles.note}>Arriving between {date}</div>
            </div>
          </div>
          <div className={Styles.sec}>
            <GiReturnArrow />
            <div>
              <div className={Styles.header}>Return Policy </div>
              <div className={Styles.note}>
                Free return within 7 days for ALL eligible items
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Delivery;
