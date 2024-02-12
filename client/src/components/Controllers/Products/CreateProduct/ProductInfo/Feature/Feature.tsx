import React, { useMemo } from "react";
import {
  CategoryFeature,
  CategoryFeatureType,
} from "../../../../../../types/category";
import productValidator from "../../../../../../validators/product";
import Input from "../../../../../shared/Input/Controller/Input";
import { useAppSelector } from "../../../../../../store/hooks";
import { ProductFeature } from "../../../../../../types/product";
import uniqId from "uniqid";
import Styles from "./feature.module.scss";

type FeatureProps = {
  id: string;
  onChange: (value: ProductFeature[], name: string) => void;
  changeOnMount: boolean;
};

function Feature({ onChange, id, changeOnMount }: FeatureProps) {
  const features = useAppSelector(
    (state) => state.controller.products.formData.features
  );
  const feature = useAppSelector((state) =>
    state.controller.products.formData.features.find((f) => f.id === id)
  ) as CategoryFeature;
  const productFeatures = useAppSelector(
    (state) => state.controller.products.product.features
  );
  const productFeature = useAppSelector(
    (state) =>
      state.controller.products.product.features.find(
        (f) => f.featureId === id
      ) as ProductFeature
  );
  const index = useAppSelector((state) =>
    state.controller.products.product.features.findIndex(
      (f) => f.featureId === id
    )
  );
  const children = features.filter((f) => f.parentId === feature.id);
  const type =
    feature.type === CategoryFeatureType.Number ? "number" : "textarea";
  const getType = (val: any) => (type === "number" ? Number(val) || 0 : val);

  const defaultValue = getType(productFeature?.value);
  const onInputChange = async (value: string): Promise<string> => {
    const id = productFeature.id;
    const newFeature = { id, value, featureId: feature.id as string };
    const isIndex = index !== -1;
    let newProductFeatures = isIndex
      ? [...productFeatures]
      : [...productFeatures, newFeature];
    if (isIndex) newProductFeatures[index] = newFeature;
    onChange(newProductFeatures, "features");
    return !children.length ? productValidator.productFeature(value) : "";
  };

  const options = useMemo(
    () => feature.options.map((opt) => ({ label: opt, defaultValue: opt })),
    []
  );

  const childFeatures = useMemo(
    () =>
      children.map((f) => (
        <Feature
          id={f.id}
          key={uniqId()}
          changeOnMount={changeOnMount}
          onChange={onChange}
        />
      )),
    []
  );

  return (
    <div className={Styles.feature}>
      {!children.length && (
        <Input
          name="options"
          label={feature.name}
          type={`${feature.options.length ? "select" : type}`}
          labelClassName={
            !feature.parentId
              ? Styles.feature_label
              : Styles.feature_label_child
          }
          defaultValue={defaultValue}
          rows={3}
          options={options}
          asInfo={!!children.length}
          onChange={(val) => onInputChange(val as string)}
          changeOnMount={changeOnMount && !children.length}
        />
      )}
      {!!children.length && (
        <div>
          <span
            className={
              !feature.parentId
                ? Styles.feature_label
                : Styles.feature_label_child
            }
          >
            {feature.name}
          </span>
        </div>
      )}
      {!!children.length && (
        <div className={Styles.feature_children}>{childFeatures}</div>
      )}
    </div>
  );
}

export default Feature;
