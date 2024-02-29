import React, { useMemo } from "react";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import Button from "../../../shared/Button/Button";
import { MdOutlineShoppingCart as CartIcon } from "react-icons/md";

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrow: false,
  autoPlay: true,
};

function MainBanners() {
  const isLoading = useAppSelector(
    (state) => state.app.isLoading || state.app.isPageLoading
  );

  const banners = useAppSelector((state) => state.app.landingPageData.banners);

  return (
    <div className={Styles.main_banners}>
      <div className={Styles.slider}>
        {!!banners.length && (
          <>
            <Slider {...sliderSettings}>
              {banners.map((banner) => (
                <Link to="" className={Styles.banner}>
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
                </Link>
              ))}
            </Slider>
          </>
        )}
      </div>
    </div>
  );
}

export default MainBanners;
