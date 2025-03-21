import React from "react";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../store/hooks";
import Slider, { Settings } from "react-slick";
import Button from "../../shared/Button/Button";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";
import uniqid from "uniqid";
import { CatalogQuery, Paths } from "../../../types";

function MainBanners() {
  const banners = useAppSelector((state) => state.app.landingPageData.banners);

  const sliderSettings = {
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    speed: 1000,
    autoplay: true,
    dots: true,
    autoplaySpeed: 5000,
  } as Settings;

  return (
    <div className={Styles.main_banners}>
      <div className={Styles.slider}>
        {!!banners.length && (
          <>
            <Slider {...sliderSettings}>
              {banners.map((banner) => (
                <div className={Styles.banner} key={uniqid()}>
                  <div
                    className={Styles.background}
                    style={{
                      backgroundImage: `linear-gradient(0deg,${banner.bannerColours[0]} 20%,${banner.bannerColours[1]} 100%)`,
                    }}
                  />
                  <div className={Styles.bars}>
                    <div className={Styles.bar} />
                    <div className={Styles.bar_curve} />
                    <div className={Styles.bar} />
                    <div className={Styles.bar_curve} />
                    <div className={Styles.bar} />
                    <div className={Styles.bar_curve} />
                  </div>
                  <div className={Styles.image}>
                    <img src={`uploads/${banner.image as string}`} />
                  </div>
                  <div className={Styles.taglines_wrapper}>
                    <div className={Styles.content}>
                      {banner.tagline.split(/\n/).map((text) => (
                        <div className={Styles.tagline} key={uniqid()}>
                          {text}
                        </div>
                      ))}
                      <Button
                        link={`${Paths.Catalog}/?${CatalogQuery.Category}=${banner.category}`}
                        value={
                          <div className={Styles.link_value}>
                            <CartIcon />
                            <span>Start Shopping</span>
                          </div>
                        }
                        className={Styles.button_link}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </>
        )}
      </div>
    </div>
  );
}

export default MainBanners;
