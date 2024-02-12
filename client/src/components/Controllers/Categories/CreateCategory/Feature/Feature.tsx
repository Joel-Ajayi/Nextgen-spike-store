import React, { useMemo, useState } from "react";
import { ReactComponent as DeleteIcon } from "../../../../../images/icons/delete.svg";
import { ReactComponent as EditIcon } from "../../../../../images/icons/edit.svg";
import { ReactComponent as SaveIcon } from "../../../../../images/icons/save.svg";
import { GrAdd as AddIcon } from "react-icons/gr";
import {
  CategoryFeature,
  CategoryFeatureType,
} from "../../../../../types/category";
import Input from "../../../../shared/Input/Controller/Input";
import Styles from "./feature.module.scss";
import { IFile } from "../../../../../types";
import categoryValidator from "../../../../../validators/category";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import controllerCatSlice, {
  defaultFeature,
} from "../../../../../store/controller/categories";
import uniqId from "uniqid";

type FeatureProps = {
  featureId: string;
  data?: CategoryFeature;
  changeOnMount: boolean;
};

const Feature = ({ featureId, changeOnMount }: FeatureProps) => {
  const dispatch = useAppDispatch();

  const setCatgeoryInput = controllerCatSlice.actions.setCatgeoryInput;

  const features = useAppSelector(
    (state) => state.controller.categories.category.features
  );

  const index = features.findIndex((f) => f.id === featureId);
  const input = features[index];

  const [isEditing, setIsEditing] = useState(!input.name);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const isValid = useMemo(() => {
    return Object.keys(errors).findIndex((err) => !!errors[err]) === -1;
  }, [errors]);

  const featureTypes = Object.values(CategoryFeatureType).filter(
    (t) => !isNaN(Number(t))
  );

  const children = features.filter((f) => f.parentId === featureId);

  const onInputChange = async (
    value: string | (IFile | number | string)[] | number | boolean | null,
    name: string
  ): Promise<string | void> => {
    const newFeatures = [...features];
    newFeatures[index] = { ...input, [name]: value };
    dispatch(setCatgeoryInput({ value: newFeatures, name: "features" }));

    const getError = async (name: string) => {
      switch (name) {
        case "name":
          const names = [""];
          return await categoryValidator.catFeatureName(value as string, names);
        case "options":
          return await categoryValidator.catFeatureOptions(value as string[]);
        default:
          return "";
      }
    };

    const error = await getError(name);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const addChildFeature = () => {
    const newFeatures = [...features];
    newFeatures[index] = { ...input, options: [] };
    const newFeature = { ...defaultFeature, id: uniqId(), parentId: featureId };
    newFeatures.push(newFeature);
    dispatch(setCatgeoryInput({ value: newFeatures, name: "features" }));
  };

  const deleteFeature = (ids: string[], newFeatures = [...features]) => {
    newFeatures = newFeatures.filter((f) => !ids.includes(f.id));
    const childFeatures = newFeatures
      .filter((f) => f.parentId && ids.includes(f.parentId))
      .map((f) => f.id);

    if (childFeatures.length) deleteFeature(childFeatures, newFeatures);

    if (ids[0] === featureId) {
      dispatch(setCatgeoryInput({ value: newFeatures, name: "features" }));
    }
  };

  return (
    <div
      className={Styles.feature_option}
      style={!isEditing ? { gap: 0 } : { gap: 15 }}
    >
      <div className={Styles.options_actions}>
        {isEditing && (
          <SaveIcon
            onClick={() => setIsEditing(!isValid)}
            className={`${!isValid ? Styles.disabled : ""} ${Styles.save_icon}`}
          />
        )}
        {!isEditing && (
          <AddIcon onClick={addChildFeature} className={Styles.add_icon} />
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
        changeOnMount={changeOnMount}
      />
      <Input
        name="type"
        label="Type"
        type="select"
        defaultValue={input.type}
        options={featureTypes.map((type, i) => ({
          label: (Object.values(CategoryFeatureType) as string[])[i],
          defaultValue: type,
        }))}
        onChange={onInputChange}
        asInfo={!isEditing}
        changeOnMount={changeOnMount}
      />
      <Input
        name="options"
        label="Options*"
        type={input.type === CategoryFeatureType.Number ? "number" : "text"}
        isMultiInput
        defaultValue=""
        defaultValues={input.options}
        onChange={onInputChange}
        asInfo={!isEditing || !!children.length}
        changeOnMount={changeOnMount}
      />
      <Input
        name="useAsFilter"
        label="Use As Filter"
        type="checkbox"
        defaultChecked={input.useAsFilter}
        span
        asInfo={!isEditing}
        onChange={onInputChange}
      />

      <section className={Styles.child_features}>
        {children.map((f) => (
          <Feature key={f.id} featureId={f.id} changeOnMount />
        ))}
      </section>
    </div>
  );
};

export default Feature;
