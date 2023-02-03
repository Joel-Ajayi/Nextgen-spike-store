import React from "react";
import Styles from "./wrapper.module.scss";
import { ReactComponent as CancelIcon } from "../../../../images/icons/close.svg";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import appSlice from "../../../../store/appState";

type WrapperProps = {
  children: JSX.Element | JSX.Element[];
};

function Wrapper({ children }: WrapperProps) {
  const isVisible = useAppSelector((state) => state.app.showModal);
  const dispatch = useAppDispatch();
  const actions = appSlice.actions;
  const handleShowModal = () => dispatch(actions.setShowModal(false));

  return (
    <>
      {isVisible && (
        <div className={Styles.wrapper}>
          <div className={Styles.content}>
            <div>{children}</div>
            <CancelIcon className={Styles.cancel} onClick={handleShowModal} />
          </div>
        </div>
      )}
    </>
  );
}

export default Wrapper;
