import React from "react";
import Styles from "./styles.module.scss";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className={Styles.footer}>
      <div className={Styles.content}>
        <section className={Styles.info}>
          <Link to="#" className={Styles.logo_wrapper}>
            <img src="/uploads/logo.svg" alt="logo" />
            <div>extGenSpike</div>
          </Link>
          <div className={Styles.spec_info}>
            <div>Home</div>
            <div>Services</div>
            <div>About Us</div>
          </div>
          <div className={Styles.spec_info}>
            <div>{window.location.hostname}</div>
            <div>yotstack@gmail.com</div>
            <div>Akure, Nigeria</div>
          </div>
        </section>
        <section className={Styles.copyright}>
          Copyrights &#169; {new Date().getFullYear()} NextGenSpike. All Rights
          Reserved.
        </section>
      </div>
    </div>
  );
}

export default Footer;
