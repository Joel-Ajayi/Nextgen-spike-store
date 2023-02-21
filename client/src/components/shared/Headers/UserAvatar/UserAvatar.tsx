import React from "react";
import Styles from "./userAvatar.module.scss";
import { useAppSelector } from "../../../../store/hooks";

function UserAvatar() {
  const { email, fullName, avatar } = useAppSelector((state) => state.user);

  return (
    <div className={Styles.avatar_wrapper}>
      <img
        className={Styles.avatar}
        src={avatar as string}
        alt="user avatart"
      />
      <div className={Styles.info}>
        {!!fullName && <div>{fullName}</div>}
        <div>{email}</div>
      </div>
    </div>
  );
}

export default UserAvatar;
