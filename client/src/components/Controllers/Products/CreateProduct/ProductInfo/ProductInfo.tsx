import React, { useEffect, useMemo, useState } from "react";
import Input from "../../../../shared/Input/Controller/Input";
import { IFile, MessageType } from "../../../../../types";
import { useAppSelector } from "../../../../../store/hooks";
import Styles from "./styles.module.scss";
import validator from "../../../../../validators";
import productValidator from "../../../../../validators/product";
import controllerPrdSlice from "../../../../../store/controller/products";
import { useDispatch } from "react-redux";
import Button from "../../../../shared/Button/Button";
import productReq from "../../../../../requests/product";
import appSlice from "../../../../../store/appState";
import { CategoryMini } from "../../../../../types/category";
import Feature from "./Feature/Feature";
import uniqid from "uniqid";
import { ProductFeature } from "../../../../../types/product";
import { useNavigate, useSearchParams } from "react-router-dom";

function ProductInfo() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let [params] = useSearchParams();

  const prd_id = (params.get("prd_id") || "").replace(/-/g, " ");

  const product = useAppSelector((state) => state.controller.products.product);
  const isUpdate = !!prd_id;
  const formData = useAppSelector(
    (state) => state.controller.products.formData
  );
  const category = formData.categories.find(
    (c) => c.cId === product.cId
  ) as CategoryMini;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const setProductInput = controllerPrdSlice.actions.setProductInput;
  const setBackgroundMsg = appSlice.actions.setBackgroundMsg;
  const setInputValidity = controllerPrdSlice.actions.setProductInputValidity;

  const isValid = useMemo(
    () => Object.values(errors).findIndex((err) => !!err) === -1,
    [errors]
  );

  useEffect(() => {
    dispatch(setInputValidity([isValid, isValid]));
  }, [isValid]);

  const onSave = async () => {
    setIsSaving(true);
    const { data, msg } = await productReq.updateProduct(true, {
      ...product,
      sku: undefined,
    });
    if (msg.msg) {
      dispatch(setBackgroundMsg(msg));
    } else if (data) {
      dispatch(
        setBackgroundMsg({ msg: "Product Saved!", type: MessageType.Success })
      );
      dispatch(setProductInput({ value: data.id, name: "id" }));
      dispatch(setProductInput({ value: data.sku, name: "sku" }));
      dispatch(setProductInput({ value: data.features, name: "features" }));
      dispatch(setProductInput({ value: data.features, name: "initFeatures" }));
      if (!prd_id) {
        navigate(
          `${window.location.pathname}${window.location.search}&prd_id=${data.id}`,
          {
            replace: true,
          }
        );
      }
    }
    setIsSaving(false);
  };

  const onInputChange = async (
    value:
      | string
      | (IFile | number | string | ProductFeature)[]
      | number
      | boolean
      | null,
    name: string
  ): Promise<string | void> => {
    dispatch(setProductInput({ value, name }));
    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await productValidator.prdName(value as string);
        case "description":
          return await productValidator.prdDesc((value as string) || "");
        case "discount":
          return await productValidator.prdDiscount(value as number);
        case "price":
          return await productValidator.prdPrice(value as number);
        case "count":
          return await productValidator.prdCount(value as number);
        case "colours":
          return await productValidator.prdColours(value as string[]);
        case "paymentType":
          return await productValidator.prdPaymentType(value as number);
        case "features":
          return await productValidator.productFeatures(
            (value as ProductFeature[]).filter((f) => f !== null)
          );
        case "mfgDate":
          return await productValidator.prdMfgDate(
            value as string,
            category.hasWarrantyAndProduction
          );
        case "warrDuration":
          return await productValidator.warrDuration(
            value as number,
            category.hasWarrantyAndProduction
          );
        case "warrCovered":
          return await productValidator.warrCovered(
            value as string,
            category.hasWarrantyAndProduction
          );
        case "images": {
          const files = (value as IFile[]).map((f) => f.file);
          return await validator.files(files, "image", 2, 3);
        }
        default:
          return "";
      }
    };
    const error = await getError(name);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const features = useMemo(
    () =>
      formData.features.map(
        (f) =>
          !f.parentId && (
            <Feature
              key={uniqid()}
              id={f.id || uniqid()}
              onChange={onInputChange}
            />
          )
      ),
    []
  );

  const images = useMemo(
    () => (
      <Input
        name="images"
        label=""
        type="image"
        isMultipleFiles
        onChange={onInputChange}
        defaultValues={product.images}
      />
    ),
    [product.images.length, product.id]
  );

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.header}>Product Info</div>
      <div className={Styles.forms}>
        <section className={Styles.main_sections}>
          <div className={Styles.main_section}>
            <Input
              name="name"
              label="Product Name"
              defaultValue={product.name}
              onChange={onInputChange}
            />
            <Input
              name="price"
              label="Price"
              defaultValue={product.price}
              type="number"
              onChange={onInputChange}
              unit="₦"
            />
            <Input
              name="discount"
              label="Discount"
              defaultValue={`${product.discount}`}
              type="number"
              onChange={onInputChange}
              unit="%"
            />
            <Input
              name="count"
              label="Number In Stock"
              defaultValue={`${product.count}`}
              type="number"
              onChange={onInputChange}
            />
            <Input
              name="colours"
              label="Product Colors"
              isMultiInput
              isColor
              type="select"
              defaultValue={formData.colours[0][0]}
              defaultValues={product.colours}
              options={formData.colours.map((colour) => ({
                defaultValue: colour[0],
                bgColor: colour[1],
              }))}
              onChange={onInputChange}
            />
            <Input
              name="paymentType"
              label="Payment Methods"
              type="select"
              defaultValue={product.paymentType}
              options={formData?.paymentTypes.map(({ type, val }) => ({
                defaultValue: val,
                label: type,
              }))}
              onChange={onInputChange}
            />
            <Input
              name="description"
              label="Description"
              defaultValue={product.description}
              rows={6}
              type="textarea"
              onChange={onInputChange}
            />
          </div>
          {category.hasWarrantyAndProduction && (
            <div className={Styles.main_section}>
              <div className={Styles.sub_section}>
                <div className={Styles.sub_section_header}>
                  Production & Warranty
                </div>
                <section>
                  <Input
                    name="warrCovered"
                    label="Warranty Covered"
                    type="textarea"
                    defaultValue={product.warrCovered}
                    onChange={onInputChange}
                  />
                  <Input
                    name="warrDuration"
                    label="Warranty Duration"
                    defaultValue={product.warrDuration}
                    type="number"
                    onChange={onInputChange}
                    unit="years"
                  />
                  <Input
                    name="mfgDate"
                    label="Production Date"
                    defaultValue={product.mfgDate}
                    onChange={onInputChange}
                    unit="year"
                  />
                </section>
              </div>
            </div>
          )}
          {!!features.length && (
            <div className={Styles.main_section}>
              <div className={Styles.sub_section}>
                <h5 className={Styles.sub_section_header}>Features Options</h5>
                <section className={Styles.feature_options}>{features}</section>
              </div>
            </div>
          )}
          <div className={Styles.main_section}>
            <div className={Styles.sub_section}>
              <div className={Styles.sub_section_header}>Production Images</div>
              {images}
            </div>
          </div>
        </section>
      </div>
      <section className={Styles.save_button}>
        <Button
          value={`${isUpdate ? "Update" : "Save"} Product`}
          type="button"
          isLoading={isSaving}
          disabled={!isValid}
          onClick={onSave}
        />
      </section>
    </div>
  );
}

export default ProductInfo;
