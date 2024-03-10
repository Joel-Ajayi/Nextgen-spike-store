import React, { useEffect, useState } from "react";
import ControllerStyles from "../../controller.module.scss";
import Button from "../../../shared/Button/Button";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { PageSections, ControllerPaths } from "../../../../types/controller";
import { Link } from "react-router-dom";
import brandReq from "../../../../requests/brand";
import brandSlice from "../../../../store/controller/brands";
import appSlice from "../../../../store/appState";
import Table from "react-bootstrap/Table";
import Styles from "./brdListing.module.scss";
import { MdModeEdit } from "react-icons/md";
import uniqid from "uniqid";

function BrandListing() {
  const [isLoading, setLoading] = useState(true);

  const dispatch = useAppDispatch();

  const brands = useAppSelector((state) => state.brands);

  const setBrands = brandSlice.actions.setBrands;

  useEffect(() => {
    (async () => {
      if (!brands.length) {
        const brds = await brandReq.getBrands();
        if (brds) {
          dispatch(setBrands(brds));
        }
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className={ControllerStyles.wrapper}>
      <div className={ControllerStyles.sec_header}>
        <div className={ControllerStyles.header_content}>
          <div className={ControllerStyles.title}>Brands Listings</div>
          <div>
            <Button
              value="ADD NEW BRAND"
              type="button"
              className={Styles.all_brd_button}
              link={`/controller/${ControllerPaths.Brand}/${PageSections.CreateBrd}`}
            />
          </div>
        </div>
      </div>
      <div className={Styles.content}>
        <Table className={`${Styles.brands_table}`} striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              brands.map((brand) => (
                <tr key={uniqid()}>
                  <td>{brand.name}</td>
                  <td>
                    <Link
                      className={Styles.edit_button}
                      to={`/controller/${ControllerPaths.Brand}/${PageSections.UpdateBrd}?brd_id=${brand.name}`}
                    >
                      <MdModeEdit height="100%" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        {isLoading && (
          <div className={Styles.spinner}>
            <SpinLoader isSmall brandColor />
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandListing;
