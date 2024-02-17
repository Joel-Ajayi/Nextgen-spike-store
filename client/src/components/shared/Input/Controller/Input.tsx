import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Styles from "./input.module.scss";
import { AiFillCloseCircle as CloseIcon } from "react-icons/ai";
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
    val: (string | IFile | number)[] | number | string | boolean | null,
    name: string
  ) => Promise<string | void>;
  label?: string;
  span?: boolean;
  isColor?: boolean;
  bgColor?: string;
  type?: string;
  labelClassName?: string;
  rows?: number;
  cols?: number;
  isMultipleFiles?: boolean;
  defaultValue?: string | number;
  defaultValues?: (string | number | IFile)[];
  defaultChecked?: boolean;
  unit?: string;
  options?: InputProps[];
  optionImg?: string;
};

function Input({
  name,
  onChange,
  label,
  type = "text",
  labelClassName = "",
  defaultValue = type === "number" ? "0" : "",
  rows = 3,
  defaultValues = [],
  options = [],
  span = false,
  isColor = false,
  isMultiInput = false,
  isMultipleFiles = false,
  defaultChecked = false,
  changeOnMount = true,
  asInfo = false,
}: InputProps) {
  const isSelect = type === "select";
  const isImage = type === "image";
  const isCheckbox = type === "checkbox";
  const isTextArea = type === "textarea";

  const [error, setError] = useState("");
  const [showSelections, setShowSelections] = useState(false);
  const [inputs, setInputs] = useState<(string | number | IFile)[]>([]);
  const [caretStyle, setCaretStyle] = useState<CSSProperties>({
    display: "none",
  });

  const inputRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (changeOnMount) {
      if (isMultiInput || isImage) {
        setInputs(defaultValues);
        if (isMultiInput && onChange) {
          (async () => {
            const error = await onChange(defaultValues, name as string);
            setError(error || "");
          })();
        } else {
          handleChange(defaultValues);
        }
      } else if (isCheckbox) {
        handleChange(defaultChecked);
      } else if (isSelect) {
        handleSelectionChange(defaultValue);
      } else {
        handleChange(defaultValue);
      }
    }
  }, [changeOnMount]);

  const changeCaretPos = () => {
    setTimeout(() => {
      if (inputRef.current) {
        setCaretStyle({
          transform: `rotate(${!showSelections ? 180 : 0}deg)`,
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
    value: string | number | (string | number | IFile)[] | boolean | null
  ) => {
    const isNumber = type === "number";
    if (onChange) {
      let error: string | void = "";
      if (!isMultiInput)
        error = await onChange(
          isNumber ? Number(value) : value,
          name as string
        );
      setError(error || "");
    }
  };

  const handleFileChange = (value: FileList) => {
    const targetFiles = isMultipleFiles ? [...inputs] : [];
    for (let index = 0; index < value.length; index++) {
      const file = value.item(index) as File;
      const b64 = window.URL.createObjectURL(file as File);
      targetFiles.push({ file, b64 });
    }
    setInputs(targetFiles);
    handleChange(targetFiles);
  };

  const handleMultiInputChange = async () => {
    if (inputRef.current && onChange) {
      const value = inputRef.current.value;
      const isNumber = type === "number";
      const isAdded = inputs.findIndex((val) => val === value) !== -1;
      if (value && !isAdded) {
        const newInputs = [...inputs, isNumber ? Number(value) : value];
        const error = await onChange(newInputs, name as string);
        setInputs(newInputs);
        setError(error || "");
      }
    }
  };

  const handleSelectionChange = (value: string | number) => {
    setShowSelections((preVal) => !preVal);
    if (inputRef.current) {
      const label = options.find(
        ({ defaultValue }) => defaultValue === value
      )?.label;

      inputRef.current.value = label || value || "None";

      setCaretStyle({
        left: inputRef.current.getBoundingClientRect().width - 22,
        transform: "rotate(180deg)",
      });
    }
    setShowSelections(false);
    if (!isMultiInput) handleChange(value);
  };

  const handleFocus = () => {
    if (type === "select" && inputRef.current) {
      inputRef.current.blur();
      setShowSelections((preVal) => !preVal);
      setCaretStyle({
        left: inputRef.current.getBoundingClientRect().width - 22,
        transform: `rotate(${showSelections ? 180 : 0}deg)`,
      });
    }

    if (asInfo && inputRef.current) {
      inputRef.current.blur();
    }
  };

  const removeFromInputs = async (index: number) => {
    const currentInputs = inputs.filter((_, i) => i !== index);
    setInputs(currentInputs);
    if (isImage) {
      const ref = inputRef.current as HTMLInputElement;
      ref.files = null;
      ref.value = "";
      handleChange(currentInputs);
      return;
    }
    const error = onChange ? await onChange(currentInputs, name as string) : "";
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
      <div className={`${labelClassName} ${Styles.label}`}>
        {label}
        {asInfo && ":"}
      </div>
      {!(asInfo && isMultiInput) && (
        <div className={Styles.input}>
          <div style={isCheckbox ? { display: "flex" } : {}}>
            {/* // text/boolean input */}
            {type !== "textarea" && !isImage && (
              <input
                ref={inputRef}
                name={name}
                type={type}
                className={inputClassName()}
                defaultValue={
                  defaultValue === "" && type === "select"
                    ? "None"
                    : defaultValue
                }
                checked={defaultChecked}
                onChange={(e) =>
                  handleChange(isCheckbox ? e.target.checked : e.target.value)
                }
                onFocus={handleFocus}
                style={{
                  cursor: isSelect || isCheckbox ? "pointer" : "auto",
                  minHeight: asInfo ? "min-content" : 33,
                  margin: asInfo && isCheckbox ? "3px 0" : 0,
                }}
                disabled={asInfo}
              />
            )}

            {/* // textarea input */}
            {isTextArea && (
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

            {/* //selections display caret and Addition button for multiInputs */}
            {!asInfo && !isImage && (
              <div className={Styles.actions}>
                {isSelect && (
                  <CaretIcon
                    className={Styles.caret}
                    style={caretStyle}
                    onClick={handleFocus}
                  />
                )}
                {isMultiInput && <AddIcon onClick={handleMultiInputChange} />}
              </div>
            )}

            {/* // files input */}
            {isImage && (
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
                  multiple={isMultipleFiles}
                  required
                  accept={CONSTS.files.mimeType.supportedImg}
                  onChange={(e) => {
                    handleFileChange(e.target.files as FileList);
                  }}
                />
              </div>
            )}
          </div>

          {/* //dropdown selection options */}
          {isSelect && showSelections && (
            <div className={Styles.selections}>
              {options?.map(({ optionImg, defaultValue, bgColor, label }) => (
                <div
                  key={uniqid()}
                  className={Styles.selection}
                  style={bgColor ? { background: bgColor } : {}}
                  onClick={() => handleSelectionChange(defaultValue as string)}
                >
                  {optionImg && (
                    <img className={Styles.selection_img} src={optionImg} />
                  )}
                  <span>{label || defaultValue || "None"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* //error message */}
      {error && <div className={Styles.error}>{error}</div>}

      {/* // multiple added inputs */}
      {!!inputs.length && (
        <div
          className={Styles.added_inputs}
          style={asInfo ? {} : { marginTop: 5 }}
        >
          {inputs.map((input, index) => {
            return (
              <div className={Styles.added_input} key={uniqid()}>
                {!asInfo && (
                  <CloseIcon
                    onClick={() => removeFromInputs(index)}
                    className={Styles.close}
                  />
                )}
                {isImage && (
                  <img className={Styles.img} src={(input as IFile).b64} />
                )}
                {!isImage && (
                  <span
                    style={isColor ? { background: input as string } : {}}
                    className={Styles.item}
                  >
                    {input as string}
                  </span>
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
