import React, { useMemo } from "react";
import { CategoryFeature } from "../../../../../../types/category";
import productValidator from "../../../../../../validators/product";
import Input from "../../../../../shared/Input/Controller/Input";
import { useAppSelector } from "../../../../../../store/hooks";
import { ProductFeature } from "../../../../../../types/product";
import uniqId from "uniqid";
import Styles from "./feature.module.scss";

type FeatureProps = {
  id: string;
  onChange: (value: ProductFeature[], name: string) => void;
};

function Feature({ onChange, id }: FeatureProps) {
  const features = useAppSelector(
    (state) => state.controller.products.formData.features
  );
  const featureTypes = useAppSelector(
    (state) => state.controller.products.formData.featureTypes
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
  const initialFeature = useAppSelector(
    (state) =>
      state.controller.products.product.initFeatures.find(
        (f) => f.featureId === id
      ) as ProductFeature
  );

  const index = useAppSelector((state) =>
    state.controller.products.product.features.findIndex(
      (f) => f.featureId === id
    )
  );
  const type = feature.options.length
    ? "select"
    : featureTypes[feature.type].toLowerCase();
  const getType = (val: any) => (type === "number" ? Number(val) || 0 : val);

  const defaultValue =
    getType(productFeature?.value) || getType(initialFeature?.value);
  const onInputChange = async (value: string): Promise<string> => {
    const id = productFeature?.id || initialFeature?.id;
    const newFeature = { id, value, featureId: feature.id as string };
    const isIndex = index !== -1;
    let newProductFeatures = isIndex
      ? [...productFeatures]
      : [...productFeatures, newFeature];
    if (isIndex) newProductFeatures[index] = newFeature;
    onChange(newProductFeatures, "features");
    return productValidator.productFeature(value);
  };

  const options = useMemo(
    () => feature.options.map((opt) => ({ label: opt, defaultValue: opt })),
    []
  );

  return (
    <div className={Styles.feature}>
      <Input
        name="options"
        label={feature.name}
        type={type as any}
        labelClassName={Styles.feature_label}
        defaultValue={defaultValue}
        rows={3}
        options={options}
        onChange={(val) => onInputChange(val as string)}
      />
    </div>
  );
}

export default Feature;
