import React, { useEffect, useMemo, useState } from "react";
import ControllerStyles from "../../controller.module.scss";
import Button from "../../../shared/Button/Button";
import SpinLoader from "../../../shared/Loader/SpinLoader/SpinLoader";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { PageSections, Pages } from "../../../../types/controller";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const brands = useAppSelector((state) => state.brands);

  const { setBrands } = brandSlice.actions;
  const { setBackgroundMsg } = appSlice.actions;

  useEffect(() => {
    (async () => {
      if (!brands.length) {
        const { brds, msg } = await brandReq.getBrands();
        if (msg) {
          dispatch(setBrands([]));
          dispatch(setBackgroundMsg(msg));
        } else if (brds) {
          dispatch(setBrands(brds));
        }
      }
      setLoading(false);
    })();
  }, []);

  const table = useMemo(() => {
    return <h1>Hey</h1>;
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
              link={`/controller?pg=${Pages.Brand}&sec=${PageSections.CreateBrd}`}
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
                      to={`/controller?pg=${Pages.Brand}&sec=${PageSections.UpdateBrd}&brd_id=${brand.name}`}
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
