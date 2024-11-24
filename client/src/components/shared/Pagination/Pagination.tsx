import React, { useEffect, useMemo, useRef, useState } from "react";
import SpinLoader from "../Loader/SpinLoader/SpinLoader";
import Styles from "./styles.module.scss";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import uniqId from "uniqid";
import { useAppSelector } from "../../../store/hooks";
import helpers from "../../../helpers";

type Props = {
  specifiedMaxButtons?: number;
  callBack: (page: number, skip: number, isLoaded: boolean) => void;
  path: string;
};

function Pagination<T>({ specifiedMaxButtons = 5, path, ...props }: Props) {
  const [pageLoading, setPageLoading] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(1);
  const [page, setPage] = useState(1);

  const ref = useRef<HTMLDivElement>(null);

  const pagination = useAppSelector((state) =>
    helpers.getStateByPath<T>(state, path)
  );

  useEffect(() => {
    if (pagination.page !== page) {
      setPage(pagination.page);
    }
  }, [pagination.page]);

  const onResize = () => {
    if (ref.current) {
      setWrapperWidth(
        () => ref.current?.getBoundingClientRect().width as number
      );
    }
  };

  const maxButtons = useMemo(
    () => Math.min(pagination.numPages, specifiedMaxButtons),
    [wrapperWidth, pagination]
  );

  const buttons = useMemo(
    () =>
      [
        ...Array.from({
          length: maxButtons,
        }),
      ].map((_, index, arr) => {
        let buttonPage = index === 0 ? 1 : pagination.numPages;
        const isAtStart = page < 4 && maxButtons !== pagination.numPages;
        const isAtEnd =
          page + 4 >= pagination.numPages &&
          page >= 4 &&
          maxButtons !== pagination.numPages;
        const isMiddle =
          !isAtEnd && !isAtStart && maxButtons !== pagination.numPages;

        if (index + 1 !== arr.length && index !== 0) {
          if (isAtStart) {
            buttonPage = index + 1;
          } else if (isMiddle) {
            switch (index + 1) {
              case 2:
                buttonPage = page - 1;
                break;
              case 3:
                buttonPage = page;
                break;
              case 4:
                buttonPage = page + 1;
                break;
            }
          } else {
            buttonPage = pagination.numPages - (arr.length - index - 1);
          }
        }
        const isSpanEnd = index + 1 === maxButtons && (isAtStart || isMiddle);
        const isSpanStart = index === 0 && (isAtEnd || isMiddle);

        return (
          <div className={Styles.button} key={uniqId()}>
            {isSpanEnd ? <span className={Styles.skipped}>...</span> : null}
            <div className={Styles.page} onClick={() => loadMore(buttonPage)}>
              {pageLoading === buttonPage ? (
                <SpinLoader isSmall radius={8} brandColor />
              ) : (
                <span className={page === buttonPage ? Styles.active : ""}>
                  {buttonPage}
                </span>
              )}
            </div>
            {isSpanStart ? <span className={Styles.skipped}>...</span> : null}
          </div>
        );
      }),
    [maxButtons, page, pageLoading, pagination]
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
    const skip = (page - 1) * pagination.take;
    await props.callBack(
      page,
      skip,
      !!pagination.list[page]?.length && !!pagination.list[page][0]
    );
    setPage(page);
    setPageLoading(0);
  };

  const changeStart = async (change: number) => {
    const newStart = page + change;
    if (newStart !== 0 && newStart <= pagination.numPages) {
      loadMore(newStart);
    }
  };
  return pagination.numPages > 1 ? (
    <div className={Styles.buttons} ref={ref}>
      {pagination.numPages >= 1 && (
        <div
          className={`${Styles.button_prev} ${
            page === 1 || pageLoading !== 0 ? Styles.disabled : ""
          }`}
          onClick={() => changeStart(-1)}
        >
          <GrFormPrevious />
        </div>
      )}
      {buttons}
      {pagination.numPages >= 1 && (
        <div
          className={`${Styles.button_next} ${
            page === pagination.numPages || pageLoading !== 0
              ? Styles.disabled
              : ""
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
