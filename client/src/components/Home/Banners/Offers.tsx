import React, { useMemo } from "react";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../store/hooks";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import Button from "../../shared/Button/Button";
import uniqid from "uniqid";
import { CatalogQuery, Paths } from "../../../types";

function Offers() {
  const offers = useAppSelector((state) => state.app.landingPageData.offers);
  const isLoading = useAppSelector(
    (state) => state.app.isLoading || state.app.isPageLoading
  );

  const sliderSettings = {
    dots: offers.length > 2,
    infinite: true,
    speed: 500,
    slidesToShow: offers.length > 1 ? 2 : 1,
    slidesToScroll: offers.length > 1 ? 2 : 1,
    arrow: false,
    autoPlay: true,
  };

  return !!offers.length ? (
    <div className={Styles.offers_wrapper}>
      <div className={Styles.header}>Special Offers</div>
      <Slider {...sliderSettings} className={Styles.offers}>
        {offers.map((banner, i) => (
          <div key={uniqid()} className={Styles.banner}>
            {banner && (
              <>
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
                      <div key={uniqid()} className={Styles.tagline}>
                        {text}
                      </div>
                    ))}
                    <Button
                      link={`${Paths.Catalog}/?${CatalogQuery.Category}=${banner?.category}&${CatalogQuery.Offers}=${banner?.id}`}
                      value={(i + 1) % 2 === 0 ? "Shop Now" : "Discover Now"}
                      className={Styles.button_link}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </Slider>
    </div>
  ) : null;
}

export default Offers;
