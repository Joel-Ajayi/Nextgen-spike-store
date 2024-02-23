import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../../../../store/hooks";
import { CategoryBanner } from "../../../../../types/category";
import Input from "../../../../shared/Input/Controller/Input";
import { IFile } from "../../../../../types";
import categoryValidator from "../../../../../validators/category";
import { ReactComponent as DeleteIcon } from "../../../../../images/icons/delete.svg";
import { ReactComponent as EditIcon } from "../../../../../images/icons/edit.svg";
import { ReactComponent as SaveIcon } from "../../../../../images/icons/save.svg";
import Styles from "./styles.module.scss";

type Props = {
  onChange: (banner: CategoryBanner | null, name: string) => void;
};

function Banner({ onChange }: Props) {
  const banner = useAppSelector(
    (state) => state.controller.categories.category.banner
  );

  const [isEditing, setIsEditing] = useState(true);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const isValid = useMemo(() => {
    return Object.keys(errors).findIndex((err) => !!errors[err]) === -1;
  }, [errors]);

  const onInputChange = async (
    val: string | number | boolean | (string | number | IFile)[] | null,
    name: string
  ) => {
    if (banner) {
      const isImage = name === "image";
      const newBanner = {
        ...banner,
        [name]: isImage ? (val as IFile[])[0] || null : val,
      };
      onChange(newBanner, "banner");
      const error = await categoryValidator.banner(newBanner, name);
      setErrors((prev) => ({ ...prev, [name]: error }));
      return error;
    }
    return "";
  };

  const deleteBanner = () => {
    onChange(null, "banner");
  };

  const image = useMemo(
    () =>
      banner && (
        <Input
          name="image"
          label="Image"
          type="image"
          onChange={onInputChange}
          defaultValues={banner.image ? [banner.image] : []}
          asInfo={!isEditing}
        />
      ),
    [banner, isEditing]
  );

  const jsxColours = useMemo(
    () =>
      banner && (
        <Input
          name="bannerColours"
          label="Banner Colour"
          type="colour"
          isMultiInput
          defaultValue={banner.bannerColours[0]}
          defaultValues={banner.bannerColours}
          onChange={onInputChange}
          asInfo={!isEditing}
        />
      ),
    [banner, isEditing]
  );

  return banner ? (
    <div
      className={Styles.sub_section}
      style={!isEditing ? { gap: 0 } : { gap: 15 }}
    >
      <div className={Styles.sub_section_actions}>
        {isEditing && (
          <SaveIcon
            onClick={() => setIsEditing(!isValid)}
            className={`${!isValid ? Styles.disabled : ""} ${Styles.save_icon}`}
          />
        )}
        {!isEditing && <EditIcon onClick={() => setIsEditing(true)} />}
        <DeleteIcon onClick={deleteBanner} />
      </div>
      <Input
        name="tagline"
        label="Tagline"
        type="textarea"
        defaultValue={banner.tagline}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      {jsxColours}
      {image}
    </div>
  ) : null;
}

export default Banner;
