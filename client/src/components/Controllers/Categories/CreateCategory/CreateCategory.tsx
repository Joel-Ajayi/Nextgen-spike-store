import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pages, PageSections } from "../../../../types/controller";
import Button from "../../../shared/Button/Button";
import Input from "../../../shared/Input/Controller/Input";
import ControllerStyles from "../../controller.module.scss";
import uniqid from "uniqid";
import Styles from "./createCat.module.scss";
import { GrAdd as AddIcon } from "react-icons/gr";
import {
  Category,
  CategoryMini,
  CategoryFeature,
} from "../../../../types/category";
import categoryReq from "../../../../requests/category";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { Brand, IFile } from "../../../../types";
import controllerCatSlice, {
  defaultFeature,
} from "../../../../store/controller/categories";
import Feature from "./Feature/Feature";
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

function CreateCategory({
  cat_id,
  parent = "",
  isUpdate = false,
}: CreateCategoryProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const statusCode = useAppSelector((state) => state.app.statusCode);
  const categories = useAppSelector(
    (state) => state.controller.categories.categories
  );
  const input = useAppSelector((state) => state.controller.categories.category);
  const index = useAppSelector((state) =>
    state.controller.categories.categories.findIndex(
      (cat) => cat.name === cat_id
    )
  );

  const { updateCategories: updateCategory, addCategory } =
    controllerCatSlice.actions;
  const setInitCategoryInput = controllerCatSlice.actions.setInitCategoryInput;
  const setCatgeoryInput = controllerCatSlice.actions.setCatgeoryInput;
  const { setStatusCode } = appSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;

  const [isLoading, setIsLoading] = useState(!!cat_id);
  const [isSaving, setIsSaving] = useState(false);
  const [parentHasWarrantyAndProduction, setParentHasWarrantyAndProduction] =
    useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  useEffect(() => {
    (async () => {
      const { brds, msg: brdMsg } = await brandReq.getBrands();
      if (!!cat_id) {
        const { cat, msg: catMsg } = await categoryReq.getCategory(cat_id);
        const { cat: parentCat } = await categoryReq.getCategory(parent);
        if (catMsg?.statusCode === 404) {
          dispatch(setStatusCode(404));
        } else if (cat) {
          let image: IFile[] = [];
          if (cat.image.length) {
            image = await request.getImageFiles(cat.image as string[]);
          }
          let banners: IFile[] = [];
          if (cat.banners.length > 0) {
            banners = await request.getImageFiles(cat.image as string[]);
          }
          if (parentCat) {
            setParentHasWarrantyAndProduction(
              parentCat.hasWarrantyAndProduction
            );
          }
          dispatch(
            setInitCategoryInput({
              ...cat,
              image,
              banners,
              hasWarrantyAndProduction:
                parentCat?.hasWarrantyAndProduction ||
                cat.hasWarrantyAndProduction,
            })
          );
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
    value:
      | string
      | (IFile | number | string | CategoryFeature)[]
      | number
      | boolean
      | null,
    name: string
  ): Promise<string | void> => {
    dispatch(setCatgeoryInput({ value, name }));
    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await categoryValidator.catName(value as string);
        case "description":
          return await categoryValidator.catDesc((value as string) || "");
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

  const onSave = async () => {
    setIsSaving(true);
    const { cat, msg } = await categoryReq.updateCat(input, isUpdate);
    if (msg) {
      dispatch(setBackgroundMsg(msg));
    } else if (cat) {
      if (isUpdate && categories.length) {
        dispatch(updateCategory({ index, cat }));
      } else {
        dispatch(addCategory(cat as CategoryMini));
      }
      const navLink = `/controller?pg=${Pages.Categories}&sec=${PageSections.CatListing}`;
      navigate(navLink, { replace: false });
    }
    setIsSaving(false);
  };

  const addChildFeature = () => {
    const newFeatures = [
      ...input.features,
      { ...defaultFeature, id: uniqid() },
    ];
    dispatch(setCatgeoryInput({ value: newFeatures, name: "features" }));
  };

  const imageInput = useMemo(
    () => (
      <Input
        name="image"
        label="Category Image"
        type="image"
        onChange={onInputChange}
        defaultValues={input.image}
        changeOnMount={!isLoading}
      />
    ),
    [input.image.length, isLoading]
  );

  const bannerInput = useMemo(
    () => (
      <Input
        name="banners"
        label="Category Banners*"
        type="image"
        isMultipleFiles
        onChange={onInputChange}
        defaultValues={input.banners}
        changeOnMount={!isLoading}
      />
    ),
    [input.banners.length, isLoading]
  );
  const features = useMemo(
    () =>
      input.features.map(
        (feature) =>
          !feature.parentId && (
            <Feature
              key={uniqid()}
              data={feature}
              featureId={feature.id as string}
              changeOnMount={!feature.name}
            />
          )
      ),

    [input.features.length, isLoading]
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
                <div className={ControllerStyles.header_content}>
                  <div className={ControllerStyles.title}>Create Category</div>
                  <div>
                    <Button
                      value="ALL CATEGORIES"
                      type="button"
                      className={Styles.all_cat_button}
                      link={`/controller?pg=${Pages.Categories}&sec=${PageSections.CatListing}`}
                    />
                  </div>
                </div>
              </div>
              <div className={Styles.content}>
                <div className={Styles.inner_content}>
                  <form className={Styles.grid_display}>
                    <section>
                      <section className={Styles.section}>
                        <Input
                          name="name"
                          label="Name"
                          defaultValue={input.name}
                          onChange={onInputChange}
                          changeOnMount={!isLoading}
                        />
                        <Input
                          name="description"
                          label="Description"
                          defaultValue={input.description}
                          rows={6}
                          type="textarea"
                          onChange={onInputChange}
                          changeOnMount={!isLoading}
                        />
                        <Input
                          name="brand"
                          label="Brand"
                          type="select"
                          defaultValue={input.brand}
                          onChange={onInputChange}
                          options={brands.map((brand) => ({
                            optionImg: brand.image[0] as string,
                            defaultValue: brand.name,
                          }))}
                          changeOnMount={!isLoading}
                        />
                        <Input
                          name="hasWarrantyAndProduction"
                          label="Has Warranty And Production Details"
                          type="checkbox"
                          defaultChecked={input.hasWarrantyAndProduction}
                          onChange={onInputChange}
                          changeOnMount={!isLoading}
                          span
                          asInfo={parentHasWarrantyAndProduction}
                        />
                      </section>

                      <section
                        className={Styles.section}
                        style={{ marginTop: 15 }}
                      >
                        {imageInput}
                        {bannerInput}
                      </section>
                    </section>

                    <section className={Styles.section}>
                      <div className={Styles.feature_options_title}>
                        <span>Feature Options</span>
                        <AddIcon
                          className={Styles.add_icon}
                          onClick={addChildFeature}
                        />
                      </div>
                      <div className={Styles.feature_options}>{features}</div>
                    </section>
                  </form>
                </div>
              </div>
              <div className={Styles.button_wrapper}>
                <Button
                  value="Save"
                  type="button"
                  isLoading={isSaving}
                  disabled={!isValid}
                  onClick={onSave}
                />
              </div>
            </>
          </div>
        </>
      )}
    </>
  );
}

export default CreateCategory;
