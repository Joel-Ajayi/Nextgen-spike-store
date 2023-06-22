import React, { useEffect, useMemo, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { IFile, IMessage } from "../../../../types";
import controllerCatSlice from "../../../../store/controller/categories";
import Filter from "./Filter/Filter";
import appSlice from "../../../../store/appState";
import Page404 from "../../../shared/Page404/Page404";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";

type CreateCategoryProps = {
  isUpdate?: boolean;
  cat_id?: string;
  parent?: string;
  type: CategoryType;
};

const defaultData: Category = {
  id: "",
  name: "",
  description: "",
  parent: "",
  image: [],
  banners: [],
  filters: [],
};

function CreateCategory({
  cat_id,
  parent = "",
  isUpdate = false,
  type,
}: CreateCategoryProps) {
  let [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!!cat_id);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(defaultData);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const statusCode = useAppSelector((state) => state.app.statusCode);
  const categories = useAppSelector(
    (state) => state.controller.category.categories
  );

  const { updateCategory, addCategory } = controllerCatSlice.actions;
  const { setStatusCode } = appSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;
  defaultData.parent = parent;
  const index = categories.findIndex((cat) => cat.name === cat_id);

  useEffect(() => {
    (async () => {
      if (!!cat_id) {
        const cat = await categoryReq.getCategory(cat_id);
        if ((cat as IMessage)?.statusCode === 404) {
          setStatusCode((cat as IMessage)?.statusCode as number);
        } else {
          let image: IFile[] = [];
          if (!!(cat as Category).image.length) {
            image = await categoryReq.getImageFiles(
              (cat as Category).image as any
            );
          }

          let banners: IFile[] = [];
          if ((cat as Category).banners.length > 0) {
            banners = await categoryReq.getImageFiles(
              (cat as Category).banners as any
            );
          }
          setForm({ ...(cat as Category), image, banners });
        }
        setIsLoading(false);
      }
    })();
  }, []);

  const isValid = useMemo(() => {
    return (
      Object.keys(errors).findIndex((err) => !!errors[err]) === -1 && !isLoading
    );
  }, [errors, isLoading]);

  const onInputChange = async (
    value: string | (IFile | string | CatFilter)[] | boolean | [] | null,
    name: string
  ): Promise<string | void> => {
    setForm((preVal) => ({ ...preVal, [name]: value }));
    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await validator.catName(value as string);
        case "description":
          return await validator.catDesc((value as string) || "");
        case "filters":
          return await validator.catFilter(value as CatFilter[]);
        case "image":
          return await validator.files(
            (value as IFile[]).map((f) => f.file),
            1,
            0,
            "image"
          );
        case "banners":
          return await validator.files(
            (value as IFile[]).map((f) => f.file),
            3,
            0,
            "image"
          );
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
      const cat = isUpdate
        ? await categoryReq.updateCat(form)
        : await categoryReq.createCat(form);
      if ((cat as IMessage)?.msg) {
        dispatch(
          setBackgroundMsg({ msg: (cat as any).msg, type: (cat as any).type })
        );
      } else {
        if (isUpdate && categories.length) {
          dispatch(updateCategory({ index, cat: cat as CategoryMini }));
        } else {
          dispatch(addCategory(cat as CategoryMini));
        }
        navigate(
          `/controller?pg=${Pages.Categories}&sec=${PageSections.Listing}`,
          { replace: false }
        );
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
    <>
      {statusCode === 404 && <Page404 />}
      {statusCode !== 404 && (
        <div className={ControllerStyles.wrapper}>
          {isLoading && (
            <div className={Styles.loader}>
              <SpinLoader brandColor />
            </div>
          )}
          {!isLoading && (
            <>
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
                      type === CategoryType.Basic ? Styles.grid_display : ""
                    }`}
                  >
                    <section
                      className={`${
                        type !== CategoryType.Basic ? Styles.grid_display : ""
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
                          name="description"
                          label="Description"
                          defaultValue={form.description}
                          rows={6}
                          type="textarea"
                          onChange={onInputChange}
                          changeOnMount
                        />
                      </section>
                      <section
                        className={Styles.section}
                        style={{ marginTop: 15 }}
                      >
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

                    {type === CategoryType.Basic && (
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
            </>
          )}
        </div>
      )}
    </>
  );
}

export default CreateCategory;
