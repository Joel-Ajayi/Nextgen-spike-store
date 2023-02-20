import React, { HTMLInputTypeAttribute, useEffect, useState } from "react";
import Styles from "./input.module.scss";

type InputProps = {
  name: string;
  onChange?: (val: string, name: string) => Promise<string | void>;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  defaultValue?: string;
  defaultChecked?: boolean;
};

function Input({
  name,
  onChange,
  defaultValue = "",
  placeholder = "",
  type = "text",
  defaultChecked = false,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const isCheckable = type === "checkbox" || type === "radio";

  useEffect(() => {
    if (defaultValue) setIsFocused(true);
  }, []);

  const handleChange = async (value: string, name: string) => {
    if (onChange) {
      const error = await onChange(value, name);
      setError(error || "");
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(!!e.target.value);
  };

  return (
    <div className={Styles.input_wrapper}>
      {!isCheckable && (
        <div className={Styles.content}>
          <input
            name={name}
            type={type}
            defaultValue={defaultValue}
            onChange={(e) => handleChange(e.target.value, e.target.name)}
            className={isFocused ? Styles.input_focus : Styles.input_blur}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
          />
          <div className={Styles.placeholder}>{placeholder}</div>
          {error && <div className={Styles.line_error} />}
          {!error && (
            <div className={isFocused ? Styles.line_focus : Styles.line_blur} />
          )}
        </div>
      )}
      {error && <div className={Styles.error}>{error}</div>}
    </div>
  );
}

export default Input;
