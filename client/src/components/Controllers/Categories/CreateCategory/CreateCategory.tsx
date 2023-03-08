import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pages, PageSections } from "../../../../types/controller";
import Button from "../../../shared/Button/Button";
import Input from "../../../shared/Input/Controller/Input";
import ControllerStyles from "../../controller.module.scss";
import uniqid from "uniqid";
import Styles from "./createCat.module.scss";
import validator from "../../../../helpers/validators";
import {
  Category,
  CategoryMini,
  CategoryType,
  CatFilter,
} from "../../../../types/category";
import categoryReq from "../../../../requests/category";
import { useAppDispatch } from "../../../../store/hooks";
import { IMessage } from "../../../../types";
import controllerCatSlice from "../../../../store/controller/categories";
import Filter from "./Filter/Filter";
import appSlice from "../../../../store/appState";

type CreateCategoryProps = {
  isUpdate?: boolean;
};

function CreateCategory({ isUpdate = false }: CreateCategoryProps) {
  let [params] = useSearchParams();
  const parent = params.get("parent") || "";
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { updateCategory, addCategory } = controllerCatSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;

  const defaultData: Category = {
    id: "",
    name: "",
    type: CategoryType.SuperOrd,
    description: "",
    parent,
    image: [],
    banners: [],
    filters: [],
  };

  if (!isUpdate) delete defaultData.id;
  const [isSaving, setIsSaving] = useState(false);
  const [form, setFormData] = useState(defaultData);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});
  const isValid = useMemo(() => {
    return Object.keys(errors).findIndex((err) => !!errors[err]) === -1;
  }, [errors]);

  const onInputChange = async (
    value: string | (File | string | CatFilter)[] | boolean | [] | null,
    name: string
  ): Promise<string | void> => {
    setFormData((preVal) => ({ ...preVal, [name]: value }));
    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await validator.catName(value as string);
        case "description":
          return await validator.catDesc((value as string) || "");
        case "filters":
          return await validator.catFilter(value as CatFilter[]);
        case "image":
          return await validator.files(value as File[], 1, 1, "image");
        case "banners":
          return await validator.files(value as File[], 3, 0, "image");
        default:
          return "";
      }
    };
    const error = await getError(name);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const onFilterChange = async (
    data: CatFilter,
    index: number,
    del = false
  ) => {
    let filters = [...form.filters, data];

    if (del) {
      filters = form.filters.filter((_, i) => i !== index);
    } else if (index !== -1) {
      filters = form.filters.map((filter, i) => (i === index ? data : filter));
    }
    await onInputChange(filters, "filters");
  };

  const onSave = async () => {
    if (isValid) {
      setIsSaving(true);
      const cat = await categoryReq.createCat(form);
      if ((cat as IMessage)?.msg) {
        dispatch(
          setBackgroundMsg({ msg: (cat as any).msg, type: (cat as any).type })
        );
      } else {
        if (isUpdate) {
          // dispatch(updateCategory(form));
        } else {
          dispatch(addCategory(cat as CategoryMini));
          navigate(
            `/controller?pg=${Pages.Categories}&sec=${PageSections.Listing}`,
            { replace: false }
          );
        }
      }
      setIsSaving(false);
    }
  };

  const imageInput = useMemo(
    () => (
      <Input
        name="image"
        label="Category Image"
        type="image"
        onChange={onInputChange}
        defaultValues={form.image as any}
        changeOnMount
      />
    ),
    [form.image]
  );

  const bannerInput = useMemo(
    () => (
      <Input
        name="banners"
        label="Category Banners*"
        type="image"
        multipleFiles
        onChange={onInputChange}
        defaultValues={form.banners as any}
        changeOnMount
      />
    ),
    [form.banners]
  );

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.title}>Create Category</div>
        <div>
          <Button
            value="ALL CATEGORIES"
            type="button"
            className={Styles.all_cat_button}
            link={`/controller?pg=${Pages.Categories}&sec=${PageSections.Listing}`}
          />
        </div>
      </div>
      <div className={Styles.content}>
        <div>
          <form
            className={`${
              form.type === CategoryType.Basic ? Styles.grid_display : ""
            }`}
          >
            <section
              className={`${
                form.type !== CategoryType.Basic ? Styles.grid_display : ""
              }`}
            >
              <section className={Styles.section}>
                <Input
                  name="name"
                  label="Name"
                  defaultValue={form.name}
                  onChange={onInputChange}
                  changeOnMount
                />
                <Input
                  name="type"
                  label="Category Type"
                  type="select"
                  opt={form.type as any}
                  defaultValue={form.type as any}
                  changeOnMount
                  options={Object.keys(CategoryType).map((type, i) => ({
                    opt: Object.values(CategoryType)[i],
                    defaultValue: type,
                  }))}
                  onChange={onInputChange}
                />
                <Input
                  name="description"
                  label="Description"
                  defaultValue={form.description}
                  rows={6}
                  type="textarea"
                  onChange={onInputChange}
                  changeOnMount
                />
              </section>
              <section className={Styles.section} style={{ marginTop: 15 }}>
                {imageInput}
                {bannerInput}
                <Button
                  value="Save"
                  type="button"
                  isLoading={isSaving}
                  disabled={!isValid}
                  onClick={onSave}
                />
              </section>
            </section>

            {form.type === CategoryType.Basic && (
              <section className={Styles.section}>
                <div className={Styles.filter_options_title}>
                  Filter Options
                </div>
                <div className={Styles.filter_options}>
                  <Filter index={-1} onChange={onFilterChange} />
                  {form.filters.map((filter, index) => (
                    <Filter
                      key={uniqid()}
                      data={filter}
                      index={index}
                      onChange={onFilterChange}
                    />
                  ))}
                </div>
              </section>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCategory;
