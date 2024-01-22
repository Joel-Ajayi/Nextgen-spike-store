import React, { useEffect, useMemo, useState } from "react";
import brandReq from "../../../../requests/brand";
import { Brand, IFile } from "../../../../types";
import Styles from "./createBrand.module.scss";
import ControllerStyles from "../../controller.module.scss";
import request from "../../../../requests";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import appSlice from "../../../../store/appState";
import Input from "../../../shared/Input/Controller/Input";
import Page404 from "../../../shared/Page404/Page404";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import Button from "../../../shared/Button/Button";
import { PageSections, Pages } from "../../../../types/controller";
import brandValidator from "../../../../validators/brand";
import validator from "../../../../validators";
import brandSlice from "../../../../store/controller/brands";

type CreateBrandProps = {
  isUpdate?: boolean;
  brd_id?: string;
};

const defaultData: Brand = { id: "", name: "", image: [] };

function CreateBrand({ isUpdate, brd_id }: CreateBrandProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const statusCode = useAppSelector((state) => state.app.statusCode);
  const brands = useAppSelector((state) => state.brands);
  const index = useAppSelector((state) =>
    state.brands.findIndex((brd) => brd.name === brd_id)
  );

  const { setStatusCode } = appSlice.actions;
  const { updateBrand, addBrand } = brandSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;
  const [isLoading, setIsLoading] = useState(!!brd_id);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(defaultData);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const isValid = useMemo(() => {
    return (
      Object.keys(errors).findIndex((err) => !!errors[err]) === -1 && !isLoading
    );
  }, [errors, isLoading]);

  useEffect(() => {
    (async () => {
      if (!!brd_id) {
        const { brd, msg } = await brandReq.getBrand(brd_id);
        if (msg?.statusCode === 404) {
          setStatusCode(msg.statusCode as number);
        } else if (brd) {
          let image: IFile[] = [];
          if (brd.image.length) {
            image = await request.getImageFiles(brd.image as any);
          }
          setForm({ ...brd, image });
        }
        setIsLoading(false);
      }
    })();
  }, []);

  const onInputChange = async (
    value: string | (IFile | number | string)[] | number | boolean | [] | null,
    name: string
  ): Promise<string | void> => {
    setForm((preVal) => ({ ...preVal, [name]: value }));
    const getError = async (name: string) => {
      switch (name) {
        case "name":
          return await brandValidator.brdName(value as string);
        case "image": {
          const files = (value as IFile[]).map((f) => f.file);
          return await validator.files(files, "image", 1);
        }
        default:
          return "";
      }
    };
    const error = await getError(name);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const imageInput = useMemo(
    () => (
      <Input
        name="image"
        label="Brand Image"
        type="image"
        onChange={onInputChange}
        defaultValues={form.image as any}
      />
    ),
    [form.image.length, isLoading]
  );

  const onSave = async () => {
    if (isValid) {
      setIsSaving(true);
      const { brd, msg } = await brandReq.updateBrd(form);
      if (msg) {
        dispatch(setBackgroundMsg(msg));
      } else if (brd) {
        if (isUpdate && brands.length) {
          dispatch(updateBrand({ index, brd }));
        } else {
          dispatch(addBrand(brd));
        }
        const navLink = `/controller?pg=${Pages.Brand}&sec=${PageSections.BrdListing}`;
        navigate(navLink, { replace: false });
      }
      setIsSaving(false);
    }
  };
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
                <div className={ControllerStyles.header_content}>
                  <div className={ControllerStyles.title}>Create Category</div>
                  <div>
                    <Button
                      value="ALL Brands"
                      type="button"
                      className={Styles.all_cat_button}
                      link={`/controller?pg=${Pages.Brand}&sec=${PageSections.BrdListing}`}
                    />
                  </div>
                </div>
              </div>
              <div className={Styles.content}>
                <div>
                  <form className={Styles.grid_display}>
                    <Input
                      name="name"
                      label="Name"
                      defaultValue={form.name}
                      onChange={onInputChange}
                    />
                    {imageInput}
                    <Button
                      className={Styles.save_button}
                      value="Save"
                      type="button"
                      isLoading={isSaving}
                      disabled={!isValid}
                      onClick={onSave}
                    />
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

export default CreateBrand;
