import React, { useMemo, useState } from "react";
import { ReactComponent as DeleteIcon } from "../../../../../images/icons/delete.svg";
import { ReactComponent as EditIcon } from "../../../../../images/icons/edit.svg";
import { ReactComponent as SaveIcon } from "../../../../../images/icons/save.svg";
import { CatFilter, CatFilterType } from "../../../../../types/category";
import Input from "../../../../shared/Input/Controller/Input";
import validator from "../../../../../helpers/validators";
import Styles from "./filter.module.scss";
import { IFile } from "../../../../../types";

type FilterProps = {
  index: number;
  onChange: (data: CatFilter, index: number, del?: boolean) => void;
  data?: CatFilter;
};

const defaultData: CatFilter = {
  id: "",
  name: "",
  unit: "",
  type: CatFilterType.Txt,
  options: [],
  isRequired: false,
};

const Filter = ({ onChange, index, data }: FilterProps) => {
  const [isEditing, setIsEdititng] = useState(index === -1);
  const [form, setFormData] = useState<CatFilter>(data || defaultData);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const isValid = useMemo(() => {
    return Object.keys(errors).findIndex((err) => !!errors[err]) === -1;
  }, [errors]);

  const onInputChange = async (
    value: string | (IFile | string)[] | boolean | null,
    name: string
  ): Promise<string | void> => {
    const newForm = { ...form, [name]: value };
    if (name === "type") newForm.options = [];
    setFormData(newForm);

    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await validator.catFilterName(value as string);
        case "unit":
          return await validator.catFilterUnit((value as string) || "");
        case "options":
          return await validator.catFilterOptions(value as string[]);
        default:
          return "";
      }
    };

    const error = await getError(name);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const toggleIsEditing = () => {
    setIsEdititng(!isEditing);
  };

  const saveFilter = (del = false) => {
    if (isValid) {
      onChange(form, index, del);
      setFormData(defaultData);
    }
  };

  return (
    <div
      className={Styles.filter_option}
      style={!isEditing ? { gap: 0 } : { gap: 15 }}
    >
      <div className={Styles.options_actions}>
        {isEditing && (
          <SaveIcon
            onClick={() => saveFilter()}
            className={`${!isValid ? Styles.disabled : ""} ${Styles.save_icon}`}
          />
        )}
        {index !== -1 && (
          <>
            {!isEditing && <EditIcon onClick={toggleIsEditing} />}
            <DeleteIcon onClick={() => saveFilter(true)} />
          </>
        )}
      </div>

      <Input
        name="name"
        label="Name"
        defaultValue={form.name}
        asInfo={!isEditing}
        onChange={onInputChange}
        changeOnMount
      />
      <Input
        name="type"
        label="Type"
        type="select"
        opt={form.type as any}
        defaultValue={form.type as any}
        asInfo={!isEditing}
        changeOnMount
        options={Object.keys(CatFilterType).map((type, i) => ({
          opt: Object.values(CatFilterType)[i],
          defaultValue: type,
        }))}
        onChange={onInputChange}
      />
      <Input
        name="unit"
        label="Unit*"
        asInfo={!isEditing}
        defaultValue={form.unit}
        onChange={onInputChange}
        changeOnMount
      />
      <Input
        name="options"
        label="Options*"
        type={form.type === CatFilterType.Num ? "number" : "text"}
        isMultiInput
        defaultValue=""
        defaultValues={form.options}
        onChange={onInputChange}
        asInfo={!isEditing}
        changeOnMount
      />
      <Input
        name="isRequired"
        label="Is Required"
        type="checkbox"
        defaultChecked={form.isRequired}
        span
        asInfo={!isEditing}
        onChange={onInputChange}
      />
    </div>
  );
};

export default Filter;
