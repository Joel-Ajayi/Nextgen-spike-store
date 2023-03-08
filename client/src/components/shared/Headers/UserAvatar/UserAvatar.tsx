import React from "react";
import Styles from "./userAvatar.module.scss";
import { useAppSelector } from "../../../../store/hooks";
import { ReactComponent as ProfileIcon } from "../../../../images/icons/account.svg";
import { Link } from "react-router-dom";

type AvatarProps = {
  showInfo?: boolean;
  infoClassName?: string;
};

function UserAvatar({ showInfo = false, infoClassName = "" }: AvatarProps) {
  const { email, fullName, avatar } = useAppSelector((state) => state.user);

  return (
    <Link to="/profile">
      <div className={Styles.avatar_wrapper}>
        {!!avatar && (
          <img
            className={Styles.avatar}
            src={avatar as string}
            alt="user avatart"
          />
        )}
        {!avatar && !!fullName && (
          <div className={Styles.name_initials}>
            <span>A</span>
          </div>
        )}
        {!avatar && !fullName && (
          <ProfileIcon
            className={Styles.default}
            style={{ width: 25, height: 25 }}
          />
        )}
        <div
          className={`${Styles.info} ${
            !showInfo ? null : Styles.show_info
          } ${infoClassName}`}
        >
          {!!fullName && <div>{fullName}</div>}
          <div>{email}</div>
        </div>
      </div>
    </Link>
  );
}

export default UserAvatar;
