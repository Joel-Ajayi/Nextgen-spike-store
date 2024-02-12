import React, { useEffect, useMemo } from "react";
import appSlice, { initialState } from "../../../store/appState";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { MessageType } from "../../../types";
import styles from "./backgroundMsg.module.scss";

function BackgroundMsg() {
  const messageTimeout = 7 * 1000;
  const dispatch = useAppDispatch();
  const { setBackgroundMsg } = appSlice.actions;
  const modalVisible = useAppSelector((state) => state.app.showModal);
  const { msg, header, transitionFrom, type } = useAppSelector(
    (state) => state.app.message
  );

  const resetMessage = () => {
    dispatch(setBackgroundMsg(initialState.message));
  };

  useEffect(() => {
    let timer: null | NodeJS.Timeout = null;
    if (msg) {
      timer = setTimeout(resetMessage, messageTimeout);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [msg, transitionFrom, type]);

  const posClassName = useMemo(() => {
    if (transitionFrom === "bottom") return styles.from_bottom;
    if (transitionFrom === "right") return styles.from_right;
    if (transitionFrom === "left") return styles.from_left;
    if (transitionFrom === "top") return styles.from_top;
    return styles.from_bottom;
  }, [transitionFrom]);

  const bgColor = useMemo(() => {
    if (type === MessageType.Error) return "#C73E1D";
    if (type === MessageType.Info) return "#17a2b8";
    if (type === MessageType.Success) return "#198754";
  }, [type]);

  return msg && type !== MessageType.NotFound ? (
    <div
      className={posClassName}
      style={{
        boxShadow: !modalVisible
          ? "2px 2px 10px rgb(218, 218, 218)"
          : "2px 2px 10px rgb(63, 63, 63)",
      }}
    >
      <div
        className={styles.icon}
        style={{ borderLeft: `7px solid ${bgColor}` }}
      >
        <div style={{ color: bgColor, border: `1px solid ${bgColor}` }}>
          {type === MessageType.Success && <span>&#10004;</span>}
          {type === MessageType.Info && <span>&#8505;</span>}
          {type === MessageType.Error && <span>&#10006;</span>}
        </div>
      </div>
      <div className={styles.msg}>
        {header && <span className={styles.header}>{header}</span>}
        <span>{msg}</span>
      </div>
    </div>
  ) : null;
}

export default BackgroundMsg;
