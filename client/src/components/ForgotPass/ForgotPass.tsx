import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import userReq from "../../requests/user";
import Styles from "./Styles.module.scss";
import Input from "../shared/Input/Input";
import { SignInFieds } from "../../types/user";

function ForgotPass() {
  let { token } = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const onInputChange = async (val: string, name: string) => {
    switch (name) {
      case "confirmPass":
        setConfirmPass(val);
        break;
      case SignInFieds.Email:
        setEmail(val);
        break;
      case SignInFieds.Pwd:
        setPassword(val);
        break;
      default:
        return "";
    }
  };

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.content}>
        <div className={Styles.header}></div>
        <div className={Styles.info}></div>
        {!!token && (
          <>
            <Input
              name={SignInFieds.Pwd}
              defaultValue={password}
              placeholder="Enter Password"
              onChange={onInputChange}
              autoComplete="off"
              type="password"
            />
            <Input
              name={"confirmPass"}
              defaultValue={confirmPass}
              placeholder="Confirm Password"
              onChange={onInputChange}
              autoComplete="off"
              type="password"
            />
          </>
        )}
        {!token && (
          <Input
            name={SignInFieds.Email}
            defaultValue={email}
            type="email"
            placeholder="Enter Email"
            onChange={onInputChange}
          />
        )}
      </div>
    </div>
  );
}

export default ForgotPass;
