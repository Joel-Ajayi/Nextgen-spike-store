import React, { useState } from "react";
import Styles from "./Styles.module.scss";
import Input from "../../shared/Input/Controller/Input";
import userSlice from "../../../store/userState";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store/hooks";
import Button from "../../shared/Button/Button";
import { FiEdit3 } from "react-icons/fi";
import userReq from "../../../requests/user";
import userValidator from "../../../validators/user";
import appSlice from "../../../store/appState";
import { MessageType, StatusCodes } from "../../../types";

type Props = {
  index: number;
  isSelection?: boolean;
};

function Address({ index, isSelection = false }: Props) {
  const dispatch = useDispatch();
  const address = useAppSelector((state) => state.user.addresses[index]);
  const states = useAppSelector((state) => state.user.states);
  const addressTypes = useAppSelector((state) => state.user.addressTypes);
  const isChecked = useAppSelector(
    (state) => state.user.selectedAddress === address.id
  );

  const updateAddress = userSlice.actions.updateAddress;
  const deleteAddress = userSlice.actions.deleteAddress;
  const [stateIndex] = useState(0);
  const [cityIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(address.isNew);
  const [isSaving, setIsSaving] = useState(false);

  const onInputChange = async (
    value: any,
    name: string
  ): Promise<string | void> => {
    dispatch(updateAddress({ id: address.id, name, value }));
    return await userValidator.address(name, value);
  };

  const selectAddress = () => {
    dispatch(userSlice.actions.setSelectedAddress(address.id));
  };

  const onCancel = () => {
    if (address.isNew) {
      dispatch(deleteAddress(index));
    } else {
      setIsEditing(false);
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    const id = await userReq.updateAddress({ ...address });
    if (id) {
      dispatch(updateAddress({ id: address.id, name: "id", value: id }));
      dispatch(
        appSlice.actions.setBackgroundMsg({
          statusCode: StatusCodes.Ok,
          type: MessageType.Success,
          msg: address.isNew ? "Address Added" : "Address Updated",
        })
      );
    }
    setIsSaving(false);
  };

  return (
    <div className={Styles.address}>
      {isSelection && !address.isNew && (
        <div className={Styles.input}>
          <input type="radio" onChange={selectAddress} checked={isChecked} />
        </div>
      )}
      <div className={Styles.content}>
        {!isEditing && (
          <div className={Styles.address_summary}>
            <div className={Styles.summary}>
              <div className={Styles.header}>
                <span>{address.name}</span>
                <span className={Styles.tag}>
                  {addressTypes[address.addressType as number].split("_")[0]}
                </span>
                <span>{`+234 ${address.tel.replace(/\s/g, "")}`}</span>
              </div>
              <div className={Styles.info}>{address.address}</div>
            </div>
            <div className={Styles.edit} onClick={() => setIsEditing(true)}>
              <FiEdit3 /> <span>Edit</span>{" "}
            </div>
          </div>
        )}
        {isEditing && (
          <>
            <div className={Styles.main}>
              <Input
                name="name"
                label="Name"
                defaultValue={address.name}
                onChange={onInputChange}
              />
              <Input
                name="tel"
                label="11-digits number (+234)"
                type="tel"
                placeholder="0123 456 7890"
                defaultValue={address.tel}
                onChange={onInputChange}
              />
              <Input
                type="select"
                label="State"
                name="state"
                defaultValue={address.state}
                onChange={onInputChange}
                options={states.map(({ name }) => ({ defaultValue: name }))}
              />
              <Input
                type="select"
                label="City/District/Town"
                name="city"
                defaultValue={address.city}
                onChange={onInputChange}
                options={states[stateIndex].cities.map((val) => ({
                  defaultValue: val.name,
                }))}
              />
              <Input
                type="select"
                label="Locality"
                name="locality"
                defaultValue={address.locality}
                onChange={onInputChange}
                options={states[stateIndex].cities[cityIndex].localities.map(
                  (val) => ({
                    defaultValue: val,
                  })
                )}
              />
              <Input
                type="select"
                label="Address Type"
                name="addressType"
                defaultValue={address.addressType}
                onChange={onInputChange}
                options={addressTypes.map((type, i) => {
                  const label = type.split("_");
                  return {
                    label: `${label[0]} (Delivery between ${label[1]} to ${label[2]})`,
                    defaultValue: i,
                  };
                })}
              />
              <Input
                name="address"
                label="Address"
                defaultValue={address.address}
                rows={3}
                type="textarea"
                onChange={onInputChange}
              />
            </div>
            <div className={Styles.actions}>
              <Button
                value={"SAVE ADDRESS"}
                isLoading={isSaving}
                disabled={isSaving}
                onClick={onSave}
              />
              <Button value="CANCEL" disabled={isSaving} onClick={onCancel} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Address;
