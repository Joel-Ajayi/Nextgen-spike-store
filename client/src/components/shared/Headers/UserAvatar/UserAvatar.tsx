import React from "react";
import Styles from "./userAvatar.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import { Link } from "react-router-dom";
import { PiUserLight as UserIcon } from "react-icons/pi";

type AvatarProps = {
  size?: number;
  showInfo?: boolean;
  infoClassName?: string;
  isLink?: boolean;
};

function UserAvatar({
  showInfo = false,
  size = 32,
  isLink = true,
}: AvatarProps) {
  const { email, fName, lName, avatar, isAuthenticated } = useAppSelector(
    (state) => state.user
  );
  const isLoading = useAppSelector((state) => state.app.isLoading);

  const avatarJSX = (
    <div className={Styles.avatar_wrapper}>
      <div
        className={Styles.name_initials}
        style={{ minWidth: size, minHeight: size, fontSize: 0.5 * size }}
      >
        {!isLoading && fName.charAt(0)}
        {!isLoading && !isAuthenticated && <UserIcon />}
      </div>
      {showInfo && (
        <div className={Styles.info}>
          {!isLoading && `Hi, ${fName} ${lName}`}
        </div>
      )}
    </div>
  );

  return isLink ? <Link to="/profile">{avatarJSX}</Link> : avatarJSX;
}

export default UserAvatar;
