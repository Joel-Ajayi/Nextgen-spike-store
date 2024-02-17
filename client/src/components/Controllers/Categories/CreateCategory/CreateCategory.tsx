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
  CategoryMini,
  CategoryFeature,
  CategoryOffer,
} from "../../../../types/category";
import categoryReq from "../../../../requests/category";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { IFile } from "../../../../types";
import controllerCatSlice, {
  defaultFeature,
  defaultOffer,
} from "../../../../store/controller/categories";
import Feature from "./SubSections/Feature";
import appSlice from "../../../../store/appState";
import Page404 from "../../../shared/Page404/Page404";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import request from "../../../../requests";
import validator from "../../../../validators";
import categoryValidator from "../../../../validators/category";
import Offer from "./SubSections/Offer";

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
  const formData = useAppSelector(
    (state) => state.controller.categories.formData
  );
  const index = useAppSelector((state) =>
    state.controller.categories.categories.findIndex(
      (cat) => cat.name === cat_id
    )
  );

  const { updateCategories: updateCategory, addCategory } =
    controllerCatSlice.actions;
  const setInitCategoryInput = controllerCatSlice.actions.setInitCategoryInput;
  const setCatgeoryInput = controllerCatSlice.actions.setCatgeoryInput;
  const setStatusCode = appSlice.actions.setStatusCode;
  const setBackgroundMsg = appSlice.actions.setBackgroundMsg;
  const setFormData = controllerCatSlice.actions.setFormData;

  const [isLoading, setIsLoading] = useState(!!cat_id);
  const [isSaving, setIsSaving] = useState(false);
  const [parentHasWarrantyAndProduction, setParentHasWarrantyAndProduction] =
    useState(false);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  useEffect(() => {
    (async () => {
      if (!!cat_id) {
        const { cat, msg: catMsg } = await categoryReq.getCategory(cat_id);
        const { cat: parentCat } = await categoryReq.getCategory(parent);
        const { data: formData } = await categoryReq.getCategoryFormData();

        if (catMsg?.statusCode === 404) {
          dispatch(setStatusCode(404));
        } else if (cat) {
          let image: IFile[] = [];
          if (cat.image.length) {
            image = await request.getImageFiles(cat.image as string[]);
          }

          if (parentCat) {
            setParentHasWarrantyAndProduction(
              parentCat.hasWarrantyAndProduction
            );
          }

          let offers: CategoryOffer[] = [];
          if (cat.offers) {
            offers = await Promise.all(
              cat.offers.map(async (offer) => {
                const banner = (
                  await request.getImageFiles([offer.banner] as string[])
                )[0];
                return { ...offer, banner };
              })
            );
          }

          dispatch(setFormData(formData));
          dispatch(
            setInitCategoryInput({
              ...cat,
              image,
              offers,
              hasWarrantyAndProduction:
                parentCat?.hasWarrantyAndProduction ||
                cat.hasWarrantyAndProduction,
            })
          );
        }
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
      | (IFile | number | string | CategoryFeature | CategoryOffer)[]
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
        case "features":
          return await categoryValidator.features(value as CategoryFeature[]);
        case "offers":
          return await categoryValidator.offers(
            value as CategoryOffer[],
            formData.offerTypes.length
          );
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

  const addFeature = () => {
    const newFeatures = [
      ...input.features,
      { ...defaultFeature, id: uniqid() },
    ];
    dispatch(setCatgeoryInput({ value: newFeatures, name: "features" }));
  };

  const addOffer = () => {
    const addedOffers = input.offers.map((f) => f.type);
    const newOfferIndex = formData.offerTypes.findIndex(
      (_, i) => !addedOffers.includes(i)
    );
    const newOffer = { ...defaultOffer, type: newOfferIndex, id: uniqid() };
    const newOffers = [...input.offers, newOffer];
    dispatch(setCatgeoryInput({ value: newOffers, name: "offers" }));
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

  const features = useMemo(
    () =>
      !isLoading &&
      input.features.map(
        (feature) =>
          !feature.parentId && (
            <Feature
              key={uniqid()}
              data={feature}
              featureId={feature.id as string}
              onChange={onInputChange}
            />
          )
      ),
    [input.features.length, isLoading]
  );

  const offers = useMemo(
    () =>
      !isLoading &&
      input.offers.map((_, i) => (
        <Offer key={uniqid()} offerIndex={i} onChange={onInputChange} />
      )),
    [input.offers.length, isLoading]
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
                          options={formData.brands.map((brand) => ({
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
                      </section>
                    </section>

                    <section className={Styles.section}>
                      <div className={Styles.sub_section_title}>
                        <span>Feature Options</span>
                        <AddIcon
                          className={Styles.add_icon}
                          onClick={addFeature}
                        />
                      </div>
                      <div className={Styles.sub_section_content}>
                        {features}
                      </div>
                    </section>

                    <section className={Styles.section}>
                      <div className={Styles.sub_section_title}>
                        <span>Offers</span>
                        {input.offers.length < formData.offerTypes.length && (
                          <AddIcon
                            className={Styles.add_icon}
                            onClick={addOffer}
                          />
                        )}
                      </div>
                      <div
                        className={Styles.sub_section_content}
                        style={{ overflow: "hidden" }}
                      >
                        <span className={Styles.error}>{errors["offers"]}</span>
                        {offers}
                      </div>
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
