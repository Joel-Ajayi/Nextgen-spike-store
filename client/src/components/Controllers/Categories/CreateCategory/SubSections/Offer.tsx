import React, { useMemo, useState } from "react";
import { CategoryOffer } from "../../../../../types/category";
import { useAppSelector } from "../../../../../store/hooks";
import Input from "../../../../shared/Input/Controller/Input";
import { IFile } from "../../../../../types";
import { MdOutlineDelete as DeleteIcon } from "react-icons/md";
import { FiEdit3 as EditIcon } from "react-icons/fi";
import { IoIosSave as SaveIcon } from "react-icons/io";
import Styles from "./styles.module.scss";
import categoryValidator from "../../../../../validators/category";

type Props = {
  offerIndex: number;
  onChange: (features: CategoryOffer[], name: string) => void;
};

function Offer({ offerIndex, onChange }: Props) {
  const { offerTypes, offerAudiences } = useAppSelector(
    (state) => state.controller.categories.formData
  );
  const offers = useAppSelector(
    (state) => state.controller.categories.category.offers
  );
  const offer = useAppSelector(
    (state) => state.controller.categories.category.offers[offerIndex]
  ) as CategoryOffer;

  const [isEditing, setIsEditing] = useState(true);
  const [errors, setErrors] = useState<{ [key in string]: string }>({});

  const isValid = useMemo(() => {
    return Object.keys(errors).findIndex((err) => !!errors[err]) === -1;
  }, [errors]);

  const onInputChange = async (
    value: (string | IFile | number)[] | number | string | boolean | null,
    name: string
  ) => {
    const isImage = name === "image";
    const inPutVal = isImage ? (value as IFile[])[0] || null : value;
    const newOffers = [...offers];
    const newOffer = { ...offer, [name]: inPutVal };
    newOffers[offerIndex] = newOffer;

    if (newOffer !== offer) {
      onChange(newOffers, "offers");
    }
    const error = await categoryValidator.offers(
      [newOffer],
      offerTypes.length,
      name
    );
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const image = useMemo(
    () => (
      <Input
        name="image"
        label="Image"
        type="image"
        onChange={onInputChange}
        defaultValues={offer.image ? [offer.image] : []}
        asInfo={!isEditing}
      />
    ),
    [offer, isEditing]
  );

  const deleteOffer = () => {
    const newOffers = [...offers].filter((_, i) => i !== offerIndex);
    onChange(newOffers, "offers");
  };

  return (
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
        <DeleteIcon onClick={deleteOffer} />
      </div>
      <Input
        name="tagline"
        label="Tagline"
        type="textarea"
        defaultValue={offer.tagline}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="type"
        label="Offer Type"
        type="select"
        defaultValue={offer.type}
        options={offerTypes.map((label, defaultValue) => ({
          label,
          defaultValue,
        }))}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="bannerColours"
        label="Banner Colour"
        type="colour"
        isMultiInput
        defaultValue={offer.bannerColours[0]}
        defaultValues={offer.bannerColours}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="audience"
        label="Target audience"
        type="select"
        defaultValue={offer.audience}
        options={offerAudiences.map((label, defaultValue) => ({
          label,
          defaultValue,
        }))}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="discount"
        label="Discount"
        type="number"
        defaultValue={offer.discount}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      <Input
        name="validUntil"
        label="Offer Ends"
        defaultValue={offer.validUntil}
        onChange={onInputChange}
        asInfo={!isEditing}
      />
      {image}
    </div>
  );
}

export default Offer;
