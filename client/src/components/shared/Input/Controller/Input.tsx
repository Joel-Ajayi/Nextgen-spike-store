import React, {
  CSSProperties,
  ChangeEvent,
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
import { ColorResult, SketchPicker } from "react-color";
import uniqid from "uniqid";
import { CONSTS } from "../../../../const";
import { IFile } from "../../../../types";
import filesHelper from "../../../../helpers/files";

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
  bgColor?: string;
  type?:
    | "colour"
    | "text"
    | "number"
    | "image"
    | "select"
    | "svg"
    | "textarea"
    | "tel"
    | "checkbox"
    | "radio";
  labelClassName?: string;
  inputClass?: string;
  placeholder?: string;
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
  inputClass = "",
  placeholder = "",
  defaultValue = type === "number" ? "0" : "",
  rows = 2,
  defaultValues = [],
  options = [],
  isMultiInput = false,
  isMultipleFiles = false,
  defaultChecked = false,
  changeOnMount = true,
  asInfo = false,
}: InputProps) {
  const isSelect = type === "select";
  const isImage = type === "image" || type === "svg";
  const isSvg = type === "svg";
  const isCheckbox = type === "checkbox" || type === "radio";
  const isTextArea = type === "textarea";
  const isTel = type === "tel";
  const isColour = type === "colour";

  const [error, setError] = useState("");
  const [showSelections, setShowSelections] = useState(false);
  const [isColorPickerVisible, setShowColorPicker] = useState(false);
  const [inputs, setInputs] = useState<(string | number | IFile)[]>([]);
  const [colour, setColour] = useState(defaultValue || "#FFFFFF");
  const [caretStyle, setCaretStyle] = useState<CSSProperties>({
    display: "none",
  });

  const inputRef = useRef<HTMLInputElement>(null);

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
      if (!isMultiInput) {
        if (typeof value === "string" && isTel) {
          // Remove all non-digit characters
          // Format the number to "0123 456 7890"
          value = value
            .replace(/\D/g, "")
            .replace(/^(\d{4})(\d{0,3})(\d{0,4})/, "$1 $2 $3")
            .trim();

          // Update the input field
          if (inputRef.current) inputRef.current.value = value;
        }
        error = await onChange(
          isNumber ? Number(value) : value,
          name as string
        );
      }
      setError(error || "");
    }
  };

  const handleTextBoxChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isColour) {
      if (!isColorPickerVisible) {
        setShowColorPicker(true);
      }
      setColour(e.target.value.toLocaleUpperCase());
      return;
    }
    handleChange(isCheckbox ? e.target.checked : e.target.value);
  };

  const handleFileChange = async (value: FileList) => {
    const targetFiles = isMultipleFiles ? [...inputs] : [];
    for (let index = 0; index < value.length; index++) {
      const file = value.item(index) as File;
      const src = await filesHelper.getBase64String(file);
      targetFiles.push({ file, src, baseUrl: "" });
    }
    setInputs(targetFiles);
    handleChange(targetFiles);
  };

  const handleMultiInputChange = async () => {
    if (inputRef.current && onChange) {
      const label = inputRef.current.value;
      const defaultValue = options.find(
        (option) => option?.label === label
      )?.defaultValue;
      const value = defaultValue || label;
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
      const label = options.find(({ defaultValue }) => defaultValue === value)
        ?.label as string;
      inputRef.current.value = label || (value as string) || "None";

      setCaretStyle({
        left: inputRef.current.getBoundingClientRect().width - 22,
        transform: "rotate(180deg)",
      });
    }
    setShowSelections(false);
    if (!isMultiInput) handleChange(value);
  };

  const handleColorChange = (colour: ColorResult) => {
    setColour(colour.hex);
  };

  const handleClosePicker = () => {
    if (inputRef.current) {
      inputRef.current.value = colour as string;
      setCaretStyle({
        left: inputRef.current.getBoundingClientRect().width - 22,
        transform: "rotate(180deg)",
      });
      handleMultiInputChange();
    }
    setShowColorPicker(false);
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

  const onClickMultiAddIcon = () => {
    if (isColour) {
      if (!isColorPickerVisible) setShowColorPicker(true);
      return;
    }
    handleMultiInputChange();
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
    const className = !isCheckbox
      ? `${Styles.input_box} `
      : `${Styles.check_box} ${type === "radio" ? Styles.radio : ""}`;
    return !asInfo || isCheckbox
      ? className
      : `${className} ${inputClass} ${Styles.box_as_info}`;
  };

  return (
    <div
      className={Styles.input_wrapper}
      style={asInfo ? { alignItems: "center" } : { flexDirection: "column" }}
    >
      {!isCheckbox && (
        <div className={`${labelClassName} ${Styles.label}`}>
          {label}
          {asInfo && !!label && ":   "}
        </div>
      )}
      {!(asInfo && isMultiInput) && (
        <div className={Styles.input}>
          <div
            style={isCheckbox ? { display: "flex", alignItems: "center" } : {}}
          >
            {/* // text/boolean/color input */}
            {!isTextArea && !isImage && !isCheckbox && (
              <input
                ref={inputRef}
                name={name}
                type={type}
                placeholder={placeholder}
                className={inputClassName()}
                defaultValue={
                  defaultValue === "" && isSelect ? "None" : defaultValue
                }
                onChange={handleTextBoxChange}
                onFocus={handleFocus}
                style={{
                  cursor: isSelect || isCheckbox ? "pointer" : "auto",
                  minHeight: asInfo ? "min-content" : 33,
                  margin: asInfo && isCheckbox ? "3px 0" : 0,
                }}
                pattern={isTel ? "[0-9]{4} [0-9]{3} [0-9]{4}" : undefined}
                disabled={asInfo}
                maxLength={isTel ? 13 : undefined}
              />
            )}

            {isCheckbox && (
              <>
                <input
                  ref={inputRef}
                  name={name}
                  type={type}
                  className={inputClassName()}
                  checked={defaultChecked}
                  onChange={handleTextBoxChange}
                  onFocus={handleFocus}
                  disabled={asInfo}
                  maxLength={isTel ? 13 : undefined}
                />
                <div className={`${labelClassName} ${Styles.label}`}>
                  {label}
                </div>
              </>
            )}

            {/* // textarea input */}
            {isTextArea && (
              <textarea
                ref={inputRef as any}
                name={name}
                rows={rows}
                className={inputClassName()}
                defaultValue={defaultValue}
                onChange={(e) => handleChange(e.target.value)}
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
                {isMultiInput && <AddIcon onClick={onClickMultiAddIcon} />}
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
                  accept={
                    isSvg
                      ? CONSTS.files.mimeType.supportedSvg
                      : CONSTS.files.mimeType.supportedImg
                  }
                  onChange={(e) => {
                    handleFileChange(e.target.files as FileList);
                  }}
                />
              </div>
            )}

            {/* Colour */}
            {isColour && isColorPickerVisible && (
              <div className={Styles.color_wrapper}>
                <CloseIcon
                  onClick={handleClosePicker}
                  className={Styles.close}
                />
                <SketchPicker
                  color={colour as string}
                  onChangeComplete={handleColorChange}
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
            const label = options.find(
              (option) => option.defaultValue === input
            )?.label;
            return (
              <div className={`${Styles.added_input}`} key={uniqid()}>
                {!asInfo && (
                  <CloseIcon
                    onClick={() => removeFromInputs(index)}
                    className={Styles.close}
                  />
                )}
                {isImage && (
                  <img
                    className={Styles.img}
                    src={`${(input as IFile).baseUrl}${(input as IFile).src}`}
                  />
                )}
                {!isImage && (
                  <span
                    style={isColour ? { background: input as string } : {}}
                    className={Styles.item}
                  >
                    {(label || input) as string}
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
