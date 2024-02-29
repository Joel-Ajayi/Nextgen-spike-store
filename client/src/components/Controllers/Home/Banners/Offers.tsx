import React, { useMemo } from "react";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import Button from "../../../shared/Button/Button";

function Offers() {
  const offers = useAppSelector((state) => state.app.landingPageData.offers);

  const sliderSettings = {
    dots: offers.length > 2,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    arrow: false,
    autoPlay: true,
  };

  return (
    <div className={Styles.offers_wrapper}>
      <div className={Styles.header}>Offers</div>
      <Slider {...sliderSettings} className={Styles.offers}>
        {offers.map((banner, i) => (
          <Link to="" className={Styles.banner}>
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
                      <div className={Styles.tagline}>{text}</div>
                    ))}
                    <Button
                      link="hs"
                      value={(i + 1) % 2 === 0 ? "Shop Now" : "Discover Now"}
                      className={Styles.button_link}
                    />
                  </div>
                </div>
              </>
            )}
          </Link>
        ))}
      </Slider>
    </div>
  );
}

export default Offers;
