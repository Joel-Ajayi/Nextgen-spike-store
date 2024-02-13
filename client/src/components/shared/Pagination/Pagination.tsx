import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pagination as PaginationType } from "../../../types";
import SpinLoader from "../Loader/SpinLoader/SpinLoader";
import Styles from "./styles.module.scss";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";

type Props<T> = {
  pagination: PaginationType<T>;
  specifiedMaxButtons?: number;
  callBack: (skip: number) => Promise<PaginationType<T>>;
};

function Pagination<T>({ specifiedMaxButtons = 10, ...props }: Props<T>) {
  const [pagination, setPagination] = useState(props.pagination);
  const [pageLoading, setPageLoading] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(1);
  const [start, setStart] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  const onResize = () => {
    if (ref.current) {
      setWrapperWidth(
        () => ref.current?.getBoundingClientRect().width as number
      );
    }
  };

  const maxButtons = useMemo(() => {
    const maxButtons = Math.max(Math.floor(wrapperWidth / 100), 2);
    return Math.min(maxButtons, specifiedMaxButtons);
  }, [wrapperWidth]);

  const buttons = useMemo(
    () =>
      [...Array.from({ length: maxButtons })].map((_, index) => {
        const page = index + start;
        return (
          <div className={Styles.button} onClick={() => loadMore(page)}>
            {pageLoading === page ? (
              <SpinLoader isSmall radius={8} brandColor />
            ) : (
              <span className={pagination.page === page ? Styles.acive : ""}>
                {page}
              </span>
            )}
          </div>
        );
      }),
    [maxButtons, start, pageLoading, pagination.page]
  );

  useEffect(() => {
    setTimeout(function () {
      onResize();
    }, 20);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const loadMore = async (page: number) => {
    if (pageLoading !== 0) return;
    setPageLoading(page);
    const skip = pagination.take * (page - 1);
    const newPagination = await props.callBack(skip);
    setPagination(newPagination);
    setPageLoading(0);
  };

  const changeStart = async (change: number) => {
    const newStart = start + change;
    if (newStart >= 1 || newStart <= pagination.numPages) {
      setStart(newStart);
    }
  };

  return pagination.numPages > 1 ? (
    <div className={Styles.buttons} ref={ref}>
      {pagination.numPages >= 1 && (
        <div
          className={`${Styles.button_prev} ${
            start === 1 ? Styles.disabled : ""
          }`}
          onClick={() => changeStart(-1)}
        >
          <GrFormPrevious />
        </div>
      )}
      {buttons}
      <span className={Styles.skipped}>...</span>
      <div className={Styles.button_last}>
        <span>{pagination.numPages}</span>
      </div>
      {pagination.numPages >= 1 && (
        <div
          className={`${Styles.button_next} ${
            start === pagination.numPages ? Styles.disabled : ""
          }`}
          onClick={() => changeStart(1)}
        >
          <GrFormNext />
        </div>
      )}
    </div>
  ) : null;
}

export default Pagination;
