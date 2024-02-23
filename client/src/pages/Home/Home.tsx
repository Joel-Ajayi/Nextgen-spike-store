import React from "react";
import BackgroundMsg from "../../components/shared/BackgroundMsg/BackgroundMsg";
import Header from "../../components/shared/Headers/AppHeader/Header";
import Styles from "./styles.module.scss";

function HomePage() {
  return (
    <>
      <BackgroundMsg />
      <div className={Styles.landing_page}>
        <section className={Styles.header_sec}>
          <Header />
          <div className={Styles.content}>
            <div className={Styles.background} />

            <div className={Styles.banner}>
              <div className={Styles.bar} />
              <div className={Styles.bar_curve} />
              <div className={Styles.bar} />
              <div className={Styles.bar_curve} />
            </div>
          </div>
        </section>

        <p>is updated</p>
      </div>
    </>
  );
}

export default HomePage;
