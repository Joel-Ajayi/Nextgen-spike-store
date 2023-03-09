import React from "react";
import styles from "./spinLoader.module.scss";

type LoaderProps = {
  radius?: number;
  isSmall?: boolean;
  brandColor?: boolean;
};

function SpinLoader({ radius, isSmall, brandColor }: LoaderProps) {
  return (
    <div
      className={`${styles.custom_loader} ${
        !radius ? `${isSmall ? styles.small : styles.big}` : ""
      } ${brandColor ? styles.brand_color : ""}`}
      style={!radius ? {} : { height: radius * 2, width: radius * 2 }}
    />
  );
}

export default SpinLoader;
