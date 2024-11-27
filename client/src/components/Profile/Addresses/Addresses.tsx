import React, { useEffect, useMemo, useRef } from "react";
import ProfileStyles from "./../Styles.module.scss";
import { useAppSelector } from "../../../store/hooks";
import { IoAdd } from "react-icons/io5";
import Styles from "./Styles.module.scss";
import userSlice from "../../../store/userState";
import { useDispatch } from "react-redux";
import Address from "./Address";
import uniqId from "uniqid";

function Addresses({ isSelection = false }: { isSelection?: boolean }) {
  const dispatch = useDispatch();
  const addresses = useAppSelector((state) => state.user.addresses);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const addAddress = userSlice.actions.addAddress;
  const isRendered = useRef(false);

  const addDummyAddress = () => {
    isRendered.current = true;
    if (addresses.length < 3) {
      dispatch(addAddress());
    }
  };

  const memoizedAddresses = useMemo(() => {
    return addresses.map((_, i) => (
      <Address key={uniqId()} index={i} isSelection={isSelection} />
    ));
  }, [addresses.length]);

  useEffect(() => {
    if (!addresses.length && !isRendered.current && isAuthenticated)
      addDummyAddress();
  }, [isAuthenticated]);

  return (
    <div className={ProfileStyles.wrapper}>
      {!isSelection && (
        <div className={ProfileStyles.sec_header}>
          <div className={ProfileStyles.header_content}>
            <div className={ProfileStyles.title}>Addresses</div>
          </div>
        </div>
      )}
      <div className={ProfileStyles.content}>
        <div className={ProfileStyles.inner_content}>
          <div className={Styles.cover}>
            <div className={Styles.addresses}>{memoizedAddresses}</div>
            {addresses.length < 3 &&
              addresses.findIndex((a) => a.isNew) === -1 && (
                <div className={Styles.add_address} onClick={addDummyAddress}>
                  <IoAdd />
                  <span>Add a New Address</span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Addresses;
