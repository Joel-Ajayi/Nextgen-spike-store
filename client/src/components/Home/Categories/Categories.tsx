import React from "react";
import Styles from "./Styles.module.scss";
import { useAppSelector } from "../../../store/hooks";
import Slider, { Settings } from "react-slick";
import { Link } from "react-router-dom";
import { BiSolidCategory as CategoryIcon } from "react-icons/bi";
import uniqid from "uniqid";

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 12,
  slidesToScroll: 12,
  responsive: [
    {
      breakpoint: 1050,
      settings: { slidesToShow: 6, slidesToScroll: 6, dots: true },
    },
    {
      breakpoint: 650,
      settings: { slidesToShow: 4, slidesToScroll: 4, dots: true },
    },
    {
      breakpoint: 400,
      settings: { slidesToShow: 3, slidesToScroll: 3, dots: true },
    },
  ],
  arrow: false,
  autoPlay: true,
} as Settings;

function Categories() {
  const isLoading = useAppSelector(
    (state) => state.app.isLoading || state.app.isPageLoading
  );
  const categories = useAppSelector(
    (state) => state.app.landingPageData.topCategories
  );

  return (
    <div className={Styles.top_cats}>
      <div className={Styles.header}>Top Categories</div>
      <Slider {...sliderSettings} className={Styles.categories} key={uniqid()}>
        {categories.map((cat) => (
          <Link to="" className={Styles.category}>
            <>
              <div className={Styles.icon}>
                {cat && (
                  <>
                    {cat.icon && <img src={`uploads/${cat.icon}`} />}
                    {!cat.icon && <CategoryIcon />}
                  </>
                )}
              </div>
              <div className={Styles.name}>
                <div>{cat && cat.name}</div>
              </div>
            </>
          </Link>
        ))}
      </Slider>
    </div>
  );
}

export default Categories;
