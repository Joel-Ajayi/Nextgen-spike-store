import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ControllerPaths, PageSections } from "../../../../types/controller";
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
  CategoryBanner,
} from "../../../../types/category";
import categoryReq from "../../../../requests/category";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { IFile } from "../../../../types";
import controllerCatSlice, {
  defaultBanner,
  defaultCategory,
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
import Banner from "./SubSections/Banner";

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
  const setCategoryInput = controllerCatSlice.actions.setCategoryInput;
  const setFormData = controllerCatSlice.actions.setFormData;

  const [isLoading, setIsLoading] = useState(!!cat_id);
  const [isSaving, setIsSaving] = useState(false);
  const [parentHasWarrantyAndProduction, setParentHasWarrantyAndProduction] =
    useState(false);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  useEffect(() => {
    (async () => {
      const formData = await categoryReq.getCategoryFormData();
      dispatch(setFormData(formData));

      if (!!cat_id) {
        const cat = await categoryReq.getCategory(cat_id);
        const parentCat = await categoryReq.getCategory(parent);

        if (cat && formData) {
          if (cat.icon) {
            cat.icon = (await request.getImageFiles([cat.icon] as string[]))[0];
          }
          if (cat?.banner) {
            cat.banner.image = (
              await request.getImageFiles([cat.banner.image] as string[])
            )[0];
          }

          if (parentCat) {
            setParentHasWarrantyAndProduction(
              parentCat.hasWarrantyAndProduction
            );
          }

          if (cat.offers) {
            cat.offers = await Promise.all(
              cat.offers.map(async (offer) => {
                const image = (
                  await request.getImageFiles([offer.image] as string[])
                )[0];
                return { ...offer, image };
              })
            );
          }

          const hasWarrantyAndProduction =
            parentCat?.hasWarrantyAndProduction || cat.hasWarrantyAndProduction;
          dispatch(
            setInitCategoryInput({ ...cat, parent, hasWarrantyAndProduction })
          );
        }
      } else {
        if (input.id) dispatch(setInitCategoryInput(defaultCategory));
      }

      setIsLoading(false);
    })();

    return () => {
      dispatch(setInitCategoryInput(defaultCategory));
    };
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
      | IFile
      | number
      | CategoryBanner
      | boolean
      | null,
    name: string
  ): Promise<string | void> => {
    const isIcon = name === "icon";
    dispatch(
      setCategoryInput({
        value: isIcon ? (value as IFile[])[0] || null : value,
        name,
      })
    );
    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await categoryValidator.catName(value as string);
        case "description":
          return await categoryValidator.catDesc((value as string) || "");
        case "icon":
          const file = (value as IFile[])[0]?.file;
          const format = ".svg+xml";
          return await validator.files(
            file ? [file] : [],
            "image",
            0,
            1,
            format
          );
        case "banner":
          return await categoryValidator.banner(value as CategoryBanner);
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
    const cat = await categoryReq.updateCat({ ...input, parent }, isUpdate);
    if (cat) {
      if (isUpdate && categories.length) {
        dispatch(updateCategory({ index, cat }));
      } else {
        dispatch(addCategory(cat as CategoryMini));
      }
      dispatch(setInitCategoryInput(defaultCategory));
      const navLink = `/controller/${ControllerPaths.Categories}/${PageSections.CatListing}`;
      navigate(navLink, { replace: false });
    }
    setIsSaving(false);
  };

  const addFeature = () => {
    const newFeatures = [
      ...input.features,
      { ...defaultFeature, id: uniqid() },
    ];
    onInputChange(newFeatures, "features");
  };

  const setBanner = () => {
    onInputChange(defaultBanner, "banner");
  };

  const addOffer = () => {
    const addedOffers = input.offers.map((f) => f.type);
    const newOfferIndex = formData.offerTypes.findIndex(
      (_, i) => !addedOffers.includes(i)
    );
    const newOffer = { ...defaultOffer, type: newOfferIndex, id: uniqid() };
    const newOffers = [...input.offers, newOffer];
    onInputChange(newOffers, "offers");
  };

  const icon = useMemo(
    () => (
      <Input
        name="icon"
        label="Catgeory Icon"
        type="svg"
        onChange={onInputChange}
        defaultValues={input?.icon ? [input.icon] : []}
        changeOnMount={!isLoading}
      />
    ),
    [input.icon, isLoading]
  );

  const features = useMemo(
    () =>
      !isLoading &&
      input.features.map((feature) => (
        <Feature
          key={uniqid()}
          data={feature}
          featureId={feature.id as string}
          onChange={onInputChange}
        />
      )),
    [input.features.length, isLoading]
  );

  const banner = useMemo(
    () => !isLoading && <Banner onChange={onInputChange} />,
    [isLoading]
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
            <div className={ControllerStyles.sec_header}>
              <div className={ControllerStyles.header_content}>
                <div className={ControllerStyles.title}>Create Category</div>
                <div>
                  <Button
                    value="ALL CATEGORIES"
                    type="button"
                    className={Styles.all_cat_button}
                    link={`/controller/${ControllerPaths.Categories}/${PageSections.CatListing}`}
                  />
                </div>
              </div>
            </div>
            <div className={ControllerStyles.content}>
              <div className={ControllerStyles.inner_content}>
                <form className={Styles.grid_display}>
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
                    {icon}

                    <section className={Styles.sub_section}>
                      <div className={Styles.sub_section_title}>
                        <span>Banner</span>
                        {!input.banner && (
                          <AddIcon
                            className={Styles.add_icon}
                            onClick={setBanner}
                          />
                        )}
                      </div>
                      {banner}
                    </section>
                  </section>

                  <section className={Styles.section}>
                    <section className={Styles.sub_section}>
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
                  </section>

                  <section className={Styles.section}>
                    <section className={Styles.sub_section}>
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
                  </section>
                </form>
                <div className={Styles.button_wrapper}>
                  <Button
                    value="Save"
                    type="button"
                    isLoading={isSaving}
                    disabled={!isValid}
                    onClick={onSave}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CreateCategory;
