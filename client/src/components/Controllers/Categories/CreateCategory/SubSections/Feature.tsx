import React, { useMemo, useState } from "react";
import { ReactComponent as DeleteIcon } from "../../../../../images/icons/delete.svg";
import { ReactComponent as EditIcon } from "../../../../../images/icons/edit.svg";
import { ReactComponent as SaveIcon } from "../../../../../images/icons/save.svg";
import { CategoryFeature } from "../../../../../types/category";
import Input from "../../../../shared/Input/Controller/Input";
import Styles from "./styles.module.scss";
import { IFile } from "../../../../../types";
import categoryValidator from "../../../../../validators/category";
import { useAppSelector } from "../../../../../store/hooks";

type FeatureProps = {
  featureId: string;
  data?: CategoryFeature;
  onChange: (features: CategoryFeature[], name: string) => void;
};

const Feature = ({ featureId, onChange }: FeatureProps) => {
  const features = useAppSelector(
    (state) => state.controller.categories.category.features
  );
  const featureTypes = useAppSelector(
    (state) => state.controller.categories.formData.featureTypes
  );

  const index = features.findIndex((f) => f.id === featureId);
  const input = features[index];

  const [isEditing, setIsEditing] = useState(!input.name);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const isValid = useMemo(() => {
    return Object.keys(errors).findIndex((err) => !!errors[err]) === -1;
  }, [errors]);

  const onInputChange = async (
    value: string | (IFile | number | string)[] | number | boolean | null,
    name: string
  ): Promise<string | void> => {
    const newFeatures = [...features];
    const newFeature = { ...input, [name]: value };
    newFeatures[index] = newFeature;

    onChange(newFeatures, "features");
    const error = await categoryValidator.features([newFeature]);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const deleteFeature = (ids: string[], newFeatures = [...features]) => {
    newFeatures = newFeatures.filter((f) => !ids.includes(f.id));
    if (ids[0] === featureId) {
      onChange(newFeatures, "features");
    }
  };

  return (
    <div
      className={Styles.sub_section}
      style={!isEditing ? { gap: 0 } : { gap: 15 }}
    >
      <div className={Styles.sub_section_actions}>
        {isEditing && (
          <SaveIcon
            onClick={() => setIsEditing(!isValid)}
            className={`${!isValid ? Styles.disabled : ""} ${Styles.save_icon}`}
          />
        )}
        {!isEditing && <EditIcon onClick={() => setIsEditing(true)} />}
        <DeleteIcon onClick={() => deleteFeature([featureId])} />
      </div>
      <Input
        name="name"
        label="Name"
        defaultValue={input.name}
        asInfo={!isEditing}
        onChange={onInputChange}
      />
      <Input
        name="type"
        label="Type"
        type="select"
        defaultValue={input.type}
        options={featureTypes.map((label, defaultValue) => ({
          label,
          defaultValue,
        }))}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="options"
        label="Options*"
        type={featureTypes[input.type] as any}
        isMultiInput
        defaultValue=""
        defaultValues={input.options}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="useAsFilter"
        label="Use As Filter"
        type="checkbox"
        defaultChecked={input.useAsFilter}
        asInfo={!isEditing}
        onChange={onInputChange}
      />
    </div>
  );
};

export default Feature;
