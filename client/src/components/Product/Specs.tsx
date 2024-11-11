import React from "react";
import Styles from "./styles.module.scss";
import Table from "react-bootstrap/Table";
import { useAppSelector } from "../../store/hooks";

function Specs() {
  const product = useAppSelector((state) => state.product);

  return (
    <div className={Styles.tab}>
      <div className={Styles.header}>Specifications</div>
      <div className={Styles.tab_content}>
        <Table responsive="md" striped style={{ maxWidth: "850px" }}>
          <tbody>
            {product.features.map((f) => (
              <tr>
                <td>
                  <b>{f.feature}</b>
                </td>
                <td>{f.value}</td>
              </tr>
            ))}
            <tr>
              <td>
                <b>Colours</b>
              </td>
              <td>
                <div className={Styles.colours}>
                  {product.colours.map((c) => (
                    <div style={{ background: c }} />
                  ))}
                </div>
              </td>
            </tr>
            {product.warrCovered ? (
              <>
                <tr>
                  <td>
                    <b>Warranty Covered</b>
                  </td>
                  <td>{product.warrCovered}</td>
                </tr>
                <tr>
                  <td>
                    <b>Warranty Duration</b>
                  </td>
                  <td>{`${product.warrDuration} months`}</td>
                </tr>
              </>
            ) : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Specs;
