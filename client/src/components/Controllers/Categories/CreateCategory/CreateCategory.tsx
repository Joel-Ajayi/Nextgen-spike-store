import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pages, PageSections } from "../../../../types/controller";
import Button from "../../../shared/Button/Button";
import Input from "../../../shared/Input/Controller/Input";
import ControllerStyles from "../../controller.module.scss";
import uniqid from "uniqid";
import Styles from "./createCat.module.scss";
import { Category, CategoryMini, CatFilter } from "../../../../types/category";
import categoryReq from "../../../../requests/category";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { Brand, IFile } from "../../../../types";
import controllerCatSlice from "../../../../store/controller/categories";
import Filter from "./Filter/Filter";
import appSlice from "../../../../store/appState";
import Page404 from "../../../shared/Page404/Page404";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import request from "../../../../requests";
import validator from "../../../../validators";
import categoryValidator from "../../../../validators/category";
import brandReq from "../../../../requests/brand";

type CreateCategoryProps = {
  isUpdate?: boolean;
  cat_id?: string;
  parent?: string;
};

const defaultData: Category = {
  id: undefined,
  name: "",
  brand: "",
  description: "",
  parent: "",
  image: [],
  banners: [],
  filters: [],
  hasWarranty: false,
};

function CreateCategory({
  cat_id,
  parent = "",
  isUpdate = false,
}: CreateCategoryProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const statusCode = useAppSelector((state) => state.app.statusCode);
  const categories = useAppSelector(
    (state) => state.controller.category.categories
  );
  const index = useAppSelector((state) =>
    state.controller.category.categories.findIndex((cat) => cat.name === cat_id)
  );

  const { updateCategory, addCategory } = controllerCatSlice.actions;
  const { setStatusCode } = appSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;
  defaultData.parent = parent;

  const [isLoading, setIsLoading] = useState(!!cat_id);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(defaultData);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  useEffect(() => {
    (async () => {
      const { brds, msg: brdMsg } = await brandReq.getBrands();
      if (!!cat_id) {
        const { cat, msg: catMsg } = await categoryReq.getCategory(cat_id);
        if (catMsg?.statusCode === 404) {
          setStatusCode(404);
        } else if (cat) {
          let image: IFile[] = [];
          if (cat.image.length) {
            image = await request.getImageFiles(cat.image as string[]);
          }
          let banners: IFile[] = [];
          if (cat.banners.length > 0) {
            banners = await request.getImageFiles(cat.image as string[]);
          }

          setForm({ ...cat, image, banners });
        }
      }

      if (brdMsg?.statusCode === 404) {
        setStatusCode(404);
      } else if (brds) {
        let brdsWithFiles = await Promise.all(
          brds.map(async (brd) => {
            const imgFile = await request.getImageFiles(brd.image as string[]);
            return { ...brd, image: [imgFile[0].b64] };
          })
        );
        brdsWithFiles.unshift({ name: "", image: [""] });
        setBrands(brdsWithFiles);
      }

      setIsLoading(false);
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
          return await categoryValidator.catName(value as string);
        case "description":
          return await categoryValidator.catDesc((value as string) || "");
        case "filters":
          return await categoryValidator.catFilter(value as CatFilter[]);
        case "image": {
          const files = (value as IFile[]).map((f) => f.file);
          return await validator.files(files, "image");
        }
        case "banners": {
          const files = (value as IFile[]).map((f) => f.file);
          return await validator.files(files, "image", 0, 3);
        }
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
      const { cat, msg } = await categoryReq.updateCat(form, isUpdate);
      if (msg) {
        dispatch(setBackgroundMsg(msg));
      } else if (cat) {
        if (isUpdate && categories.length) {
          dispatch(updateCategory({ index, cat }));
        } else {
          dispatch(addCategory(cat as CategoryMini));
        }
        const navLink = `/controller?pg=${Pages.Categories}&sec=${PageSections.Listing}`;
        navigate(navLink, { replace: false });
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
        defaultValues={form.image}
        changeOnMount={!isLoading}
      />
    ),
    [form.image.length, isLoading]
  );

  const bannerInput = useMemo(
    () => (
      <Input
        name="banners"
        label="Category Banners*"
        type="image"
        isMultipleFiles
        onChange={onInputChange}
        defaultValues={form.banners}
        changeOnMount={!isLoading}
      />
    ),
    [form.banners.length, isLoading]
  );

  const filters = useMemo(
    () =>
      form.filters.map((filter, index) => (
        <Filter
          key={uniqid()}
          data={filter}
          index={index}
          onChange={onFilterChange}
          changeOnMount={!isLoading}
        />
      )),
    [form.filters.length, isLoading]
  );

  return (
    <>
      {statusCode === 404 && <Page404 />}
      {statusCode !== 404 && (
        <>
          {isLoading && (
            <div className={Styles.loader}>
              <SpinLoader brandColor />
            </div>
          )}
          <div className={ControllerStyles.wrapper}>
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
                  <form className={Styles.grid_display}>
                    <section>
                      <section className={Styles.section}>
                        <Input
                          name="name"
                          label="Name"
                          defaultValue={form.name}
                          onChange={onInputChange}
                          changeOnMount={!isLoading}
                        />
                        <Input
                          name="description"
                          label="Description"
                          defaultValue={form.description}
                          rows={6}
                          type="textarea"
                          onChange={onInputChange}
                          changeOnMount={!isLoading}
                        />
                        <Input
                          name="brand"
                          label="Brand"
                          type="select"
                          defaultValue={form.brand}
                          onChange={onInputChange}
                          options={brands.map((brand) => ({
                            optionImg: brand.image[0] as string,
                            defaultValue: brand.name,
                          }))}
                          changeOnMount={!isLoading}
                        />
                        <Input
                          name="hasWarranty"
                          label="Has warranty"
                          type="checkbox"
                          defaultChecked={form.hasWarranty}
                          onChange={onInputChange}
                          changeOnMount={!isLoading}
                          span
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

                    <section className={Styles.section}>
                      <div className={Styles.filter_options_title}>
                        Filter Options
                      </div>
                      <div className={Styles.filter_options}>
                        <Filter
                          index={-1}
                          onChange={onFilterChange}
                          changeOnMount={!isLoading}
                        />
                        {filters}
                      </div>
                    </section>
                  </form>
                </div>
              </div>
            </>
          </div>
        </>
      )}
    </>
  );
}

export default CreateCategory;
