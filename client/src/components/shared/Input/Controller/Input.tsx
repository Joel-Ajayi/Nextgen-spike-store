import React, { CSSProperties, useEffect, useRef, useState } from "react";
import Styles from "./input.module.scss";
import { ReactComponent as CaretIcon } from "./../../../../images/icons/caret.svg";
import { ReactComponent as AddIcon } from "./../../../../images/icons/add.svg";
import { ReactComponent as DownloadIcon } from "./../../../../images/icons/download.svg";

import uniqid from "uniqid";
import { CONSTS } from "../../../../const";
import { IFile } from "../../../../types";

type InputProps = {
  name?: string;
  isMultiInput?: boolean;
  asInfo?: boolean;
  changeOnMount?: boolean;
  onChange?: (
    val: (string | IFile)[] | string | boolean | null,
    name: string
  ) => Promise<string | void>;
  label?: string;
  span?: boolean;
  type?:
    | "number"
    | "color"
    | "date"
    | "text"
    | "textarea"
    | "select"
    | "image"
    | "video"
    | "checkbox";
  opt?: string;
  rows?: number;
  cols?: number;
  multipleFiles?: boolean;
  defaultValue?: string;
  defaultValues?: (string | IFile | number)[];
  defaultChecked?: boolean;
  unit?: string;
  options?: InputProps[];
};

function Input({
  name,
  onChange,
  asInfo = false,
  label,
  type = "text",
  defaultValue = type === "number" ? "0" : "",
  isMultiInput = false,
  defaultChecked = false,
  unit = "",
  rows = 3,
  defaultValues = [],
  multipleFiles = false,
  options,
  span = false,
}: InputProps) {
  const [error, setError] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [inputs, setInputs] = useState<(string | IFile | number)[]>([]);
  const [caretStyle, setCaretStyle] = useState<CSSProperties>({
    display: "none",
  });

  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (isMultiInput || type === "image") {
      setInputs(defaultValues);
      if ((defaultValues[0] as IFile)?.file) {
        handleChange(defaultValues.map((file) => (file as any).file));
      } else {
        handleChange(defaultValues as any);
      }
    } else if (type === "checkbox") {
      handleChange(defaultChecked);
    } else {
      handleChange(defaultValue);
    }
  }, []);

  const changeCaretPos = () => {
    setTimeout(() => {
      if (inputRef.current) {
        setCaretStyle({
          transform: `rotate(${!showOptions ? 180 : 0}deg)`,
        });
      }
    }, 100);
  };

  useEffect(() => {
    changeCaretPos();
    window.addEventListener("resize", changeCaretPos);
    return () => {
      window.removeEventListener("resize", changeCaretPos);
    };
  }, []);

  const handleChange = async (
    value: string | (string | File)[] | boolean | null
  ) => {
    if (onChange) {
      let error: string | void = "";
      if (type === "image") {
        const files = (value as File[]).map(
          (file) =>
            ({ file, b64: window.URL.createObjectURL(file as File) } as any)
        );
        setInputs(files);
        error = await onChange(files, name as string);
      } else if (!isMultiInput) {
        error = await onChange(value as any, name as string);
      }
      setError(error || "");
    }
  };

  const handleMultiItemsChange = async () => {
    if (inputRef.current && onChange) {
      const value = inputRef.current.value;
      const alreadyAdded = inputs.findIndex((val) => val === value) !== -1;
      if (value && !alreadyAdded) {
        const newInputs = [...inputs, value];
        const error = await onChange(newInputs, name as string);
        setInputs(newInputs);
        setError(error || "");
      }
    }
  };

  const handleOptionsChange = (opt: string, value: string) => {
    console.log(opt);
    setShowOptions((preVal) => !preVal);
    if (inputRef.current) {
      inputRef.current.value = opt;
      setCaretStyle({
        left: inputRef.current.getBoundingClientRect().width - 22,
        transform: "rotate(180deg)",
      });
    }
    handleChange(value);
  };

  const handleFocus = () => {
    if (type === "select" && inputRef.current) {
      inputRef.current.blur();
      setShowOptions((preVal) => !preVal);
      setCaretStyle({
        left: inputRef.current.getBoundingClientRect().width - 22,
        transform: `rotate(${showOptions ? 180 : 0}deg)`,
      });
    }

    if (asInfo && inputRef.current) {
      inputRef.current.blur();
    }
  };

  const removeFromInputs = async (index: number) => {
    const currentInputs = inputs.filter((_, i) => i !== index) as any[];
    if (type === "image") {
      const ref = inputRef.current as HTMLInputElement;
      ref.files = null;
      ref.value = "";
      handleChange(currentInputs as any);
      return;
    }
    const error = onChange ? await onChange(currentInputs, name as string) : "";
    setInputs(currentInputs);
    setError(error || "");
  };

  const inputClassName = () => {
    const className = type !== "checkbox" ? Styles.input_box : Styles.check_box;
    return !asInfo || type === "checkbox"
      ? className
      : `${className} ${Styles.box_as_info}`;
  };

  return (
    <div
      className={Styles.input_wrapper}
      style={
        span || asInfo ? { alignItems: "center" } : { flexDirection: "column" }
      }
    >
      <div className={Styles.label}>
        {label}
        {asInfo && ":"}
        {!!unit && <span className={Styles.unit}>{`(${unit})`}</span>}
      </div>
      {!(asInfo && isMultiInput) && (
        <div className={Styles.input}>
          <div style={type === "checkbox" ? { display: "flex" } : {}}>
            {/* // text/boolean input */}
            {type !== "textarea" && type !== "image" && (
              <input
                ref={inputRef}
                name={name}
                type={type}
                className={inputClassName()}
                defaultValue={defaultValue}
                defaultChecked={defaultChecked}
                onChange={(e) =>
                  handleChange(
                    type === "checkbox" ? e.target.checked : e.target.value
                  )
                }
                onFocus={handleFocus}
                style={{
                  cursor:
                    type === "select" || type === "checkbox"
                      ? "pointer"
                      : "auto",
                  minHeight: asInfo ? "min-content" : 33,
                  margin: asInfo && type !== "checkbox" ? "3px 0" : 0,
                }}
                disabled={asInfo}
              />
            )}
            {/* // files input */}
            {type === "image" && (
              <div className={Styles.files_area}>
                <DownloadIcon className={Styles.download_icon} />
                <div>
                  <b>Choose a file </b>or drag it here
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  title=" "
                  className={Styles.input_box}
                  multiple={multipleFiles}
                  required
                  accept={CONSTS.files.mimeType.supportedImg}
                  onChange={(e) => {
                    const newInputs = multipleFiles
                      ? [...inputs, ...(e.target.files as any)]
                      : [];
                    handleChange([...newInputs, ...(e.target.files as any)]);
                  }}
                />
              </div>
            )}
            {/* // textarea input */}
            {type === "textarea" && (
              <textarea
                ref={inputRef}
                name={name}
                rows={rows}
                className={inputClassName()}
                defaultValue={defaultValue}
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
                onFocus={handleFocus}
                disabled={asInfo}
              />
            )}
            {/* //select input caret | */}
            {!asInfo && (
              <div className={Styles.actions}>
                {type === "select" && (
                  <CaretIcon
                    className={Styles.caret}
                    style={caretStyle}
                    onClick={handleFocus}
                  />
                )}
                {!(type === "image") && isMultiInput && (
                  <AddIcon onClick={handleMultiItemsChange} />
                )}
              </div>
            )}
          </div>
          {/* //dropdown selection options */}
          {type === "select" && showOptions && (
            <div className={Styles.options}>
              {options?.map(
                ({ opt, defaultValue }) =>
                  defaultValue && (
                    <div
                      key={uniqid()}
                      className={Styles.option}
                      onClick={() =>
                        handleOptionsChange(opt as any, defaultValue)
                      }
                    >
                      {opt}
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      )}
      {/* //error message */}
      {error && <div className={Styles.error}>{error}</div>}
      {/* // multiple added inputs */}
      {(isMultiInput || type === "image") && !!inputs.length && (
        <div
          className={Styles.added_inputs}
          style={asInfo ? {} : { marginTop: 5 }}
        >
          {inputs.map((input, index) => {
            return (
              <div className={Styles.added_input} key={uniqid()}>
                {!asInfo && (
                  <span
                    onClick={() => removeFromInputs(index)}
                    className={Styles.close}
                  >
                    &#10006;
                  </span>
                )}
                {type === "image" && (
                  <img className={Styles.img} src={(input as IFile).b64} />
                )}
                {!(type === "image") && (
                  <span className={Styles.item}>{input as string}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Input;
