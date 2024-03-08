import React, { useEffect, useMemo, useState } from "react";
import Styles from "./styles.module.scss";
import Input from "../../../../shared/Input/Controller/Input";
import { useAppSelector } from "../../../../../store/hooks";
import { useDispatch } from "react-redux";
import controllerPrdSlice from "../../../../../store/controller/products";
import CatList from "./CatList/CatList";
import Button from "../../../../shared/Button/Button";
import {
  CreatePrdSections,
  PageSections,
  Pages,
} from "../../../../../types/controller";
import brandValidator from "../../../../../validators/brand";
import { useSearchParams } from "react-router-dom";

function CatgeoryAndBrand() {
  const dispatch = useDispatch();
  let [params] = useSearchParams();

  const form = useAppSelector((state) => state.controller.products.product);
  const formData = useAppSelector(
    (state) => state.controller.products.formData
  );

  const prd_id = (params.get("prd_id") || "").replace(/-/g, " ");

  const setProductInput = controllerPrdSlice.actions.setProductInput;
  const setInputValidity = controllerPrdSlice.actions.setProductInputValidity;

  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const onInputChange = async (
    value: string | number | any,
    name: string
  ): Promise<string | void> => {
    if (name !== "cId") dispatch(setProductInput({ value, name }));

    const getError = async () => {
      switch (name) {
        case "cId":
          if ((value as number) < 0) return "No Category Choosen";
          break;
        case "brand":
          return await brandValidator.brdName(value as string);
        default:
          return "";
      }
    };

    const error = await getError();
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const isValid = useMemo(() => {
    return Object.values(errors).findIndex((err) => !!err) === -1;
  }, [errors]);

  useEffect(() => {
    onInputChange(form.cId, "cId");
  }, [form.cId]);

  useEffect(() => {
    dispatch(setInputValidity([isValid, false]));
  }, [isValid]);

  return (
    <div className={Styles.wrapper}>
      <section>
        <h5 className={Styles.header}>Categories</h5>
        <div className={Styles.cat_wrapper}>
          <CatList />
        </div>
        {errors["cId"] && <div className={Styles.error}>{errors["cId"]}</div>}
      </section>
      <section>
        <h5 className={Styles.header}>Brands</h5>
        <Input
          name="brand"
          type="select"
          defaultValue={form.brand}
          options={formData?.brands.map(({ image, name }) => ({
            optionImg: image[0] as string,
            defaultValue: name,
          }))}
          onChange={onInputChange}
        />
      </section>

      <section className={Styles.save_button}>
        <Button
          value="Next"
          type="button"
          disabled={!isValid}
          link={`/controller/${Pages.Products}/${PageSections.CreatePrd}?sub=${
            CreatePrdSections.ProductInfo
          }${prd_id ? `&prd_id=${prd_id}` : ""}`}
        />
      </section>
    </div>
  );
}

export default CatgeoryAndBrand;
