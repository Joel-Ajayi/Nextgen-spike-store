import React, { useEffect } from "react";
import BackgroundMsg from "../components/shared/BackgroundMsg/BackgroundMsg";
import Header from "../components/shared/Headers/AppHeader/Header";
import Styles from "./styles.module.scss";
import MainBanners from "../components/Home/Banners/MainBanners";
import Categories from "../components/Home/Categories/Categories";
import SubBanners from "../components/Home/Banners/Offers";
import Footer from "../components/shared/Footer/Footer";
import { useAppSelector } from "../store/hooks";
import appSlice from "../store/appState";
import globalReq from "../requests/global";
import { useDispatch } from "react-redux";
import Features from "../components/Home/Features/Features";
import Products from "../components/Home/Products/Products";

function HomePage() {
  const dispatch = useDispatch();
  const isLoading = useAppSelector(
    (state) => !state.app.landingPageData.topCategories[0]
  );

  const setLandingPageData = appSlice.actions.setLandingPageData;
  const setPageLoading = appSlice.actions.setPageLoading;

  useEffect(() => {
    (async () => {
      if (isLoading) {
        const res = await globalReq.getLandingPageData();
        if (res) {
          dispatch(setLandingPageData(res));
        }
      }
      dispatch(setPageLoading(false));
    })();
  }, [isLoading]);

  return (
    <>
      <BackgroundMsg />
      <div className={Styles.page} style={{ rowGap: "3rem" }}>
        <section className={Styles.header_sec}>
          <Header />
          <MainBanners />
        </section>
        <Categories />
        <SubBanners />
        <Products />
        <Features />
        <Footer />
      </div>
    </>
  );
}

export default HomePage;
