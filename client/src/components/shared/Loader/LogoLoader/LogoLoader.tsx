import React, { CSSProperties, useMemo } from "react";
import Styles from "./logoLoader.module.scss";

type LoaderProps = {
  isLocal?: boolean;
};

function LogoLoader({ isLocal = false }: LoaderProps) {
  const style = useMemo(() => {
    const loaderStyles: CSSProperties = {};
    if (isLocal) {
      loaderStyles.position = "absolute";
    } else {
      loaderStyles.position = "fixed";
    }
    return loaderStyles;
  }, []);

  return (
    <div style={style} className={Styles.loader_wrapper}>
      <img src="/uploads/logo.png" alt="page loading" />
    </div>
  );
}

export default LogoLoader;
