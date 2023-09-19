import React from "react";
import Styles from "./userAvatar.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import { ReactComponent as ProfileIcon } from "../../../../images/icons/account.svg";
import { Link } from "react-router-dom";

type AvatarProps = {
  size?: number;
  showInfo?: boolean;
  infoClassName?: string;
};

function UserAvatar({ showInfo = false, infoClassName = "", size = 32 }: AvatarProps) {
  const { email, fName, lName, avatar } = useAppSelector((state) => state.user);

  return (
    <Link to="/profile">
      <div className={Styles.avatar_wrapper}>
        {!avatar && (<div className={Styles.name_initials} style={{ width: size, height: size }}><span>{fName.charAt(0)}</span></div>)}
      </div>
    </Link>
  );
}

export default UserAvatar;
