import React, { useState } from "react";
import Styles from "./input.module.scss";

type InputProps = {
  placeholder: string;
};

function Input({ placeholder }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={Styles.input_wrapper}>
      <input
        className={isFocused ? Styles.input_focus : Styles.input_blur}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => !e.target.value && setIsFocused(false)}
      />
      <div className={Styles.placeholder}>{placeholder}</div>
      <div
        className={
          isFocused ? Styles.line_animation_focus : Styles.line_animation_blur
        }
      />
    </div>
  );
}

export default Input;
