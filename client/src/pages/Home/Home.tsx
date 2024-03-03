import React, { useEffect } from "react";
import BackgroundMsg from "../../components/shared/BackgroundMsg/BackgroundMsg";
import Header from "../../components/shared/Headers/AppHeader/Header";
import Styles from "./styles.module.scss";
import MainBanners from "../../components/Controllers/Home/Banners/MainBanners";
import Categories from "../../components/Controllers/Home/Categories/Categories";
import SubBanners from "../../components/Controllers/Home/Banners/Offers";
import Footer from "../../components/shared/Footer/Footer";
import { useAppSelector } from "../../store/hooks";
import appSlice from "../../store/appState";
import globalReq from "../../requests/global";
import { useDispatch } from "react-redux";
import Features from "../../components/Controllers/Home/Features/Features";
import Products from "../../components/Controllers/Home/Products/Products";

function HomePage() {
  const dispatch = useDispatch();
  const isLoaded = useAppSelector(
    (state) => !!state.app.landingPageData.categories?.length
  );

  const setLandingPageData = appSlice.actions.setLandingPageData;
  const setPageLoading = appSlice.actions.setPageLoading;

  useEffect(() => {
    (async () => {
      if (!isLoaded) {
        const res = await globalReq.getLandingPageData();
        if (res) {
          dispatch(setLandingPageData(res));
        }
      }
      dispatch(setPageLoading(false));
    })();
  }, []);

  return (
    <>
      <BackgroundMsg />
      <div className={Styles.landing_page}>
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
