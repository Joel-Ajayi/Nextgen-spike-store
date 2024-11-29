import React from "react";
import { Link } from "react-router-dom";
import Styles from "./Styles.module.scss";
import { ControllerPaths } from "../../../../types/controller";
import { Paths } from "../../../../types";
import { UserPaths } from "../../../../types/user";
import helpers from "../../../../helpers";
import { OrderMini } from "../../../../types/product";
import uniqId from "uniqid";

function OrderCard({
  order,
  isController = false,
}: {
  order: OrderMini | null;
  isController?: boolean;
}) {
  const link = isController
    ? `${Paths.Controller}/${ControllerPaths.Orders}/${order?.id}`
    : `${Paths.Profile}/${UserPaths.Orders}/${order?.id}`;

  const isLoaded = !!order;
  const imgLength = order?.items?.length || 1;
  const isOdd = imgLength % 2 !== 0;
  const imgRows = Math.ceil(Math.sqrt(imgLength));
  const imgCols = Math.ceil(imgLength / imgRows);
  const count = !isLoaded
    ? 1
    : order.items.reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <Link to={isLoaded ? link : ""} className={Styles.wrapper}>
      <div className={Styles.inner_wrapper}>
        <div
          className={Styles.images}
          style={{
            gridTemplateRows: `repeat(${imgRows}, 1fr)`,
            gridTemplateColumns: `repeat(${imgCols}, 1fr)`,
          }}
        >
          {!!order &&
            order.items.map((i, index) => (
              <div
                key={uniqId()}
                className={Styles.img}
                style={
                  isOdd && index + 1 === imgLength
                    ? { gridColumn: `span ${imgCols}` }
                    : {}
                }
              >
                <img src={`/uploads/${i.image}`} />
              </div>
            ))}
        </div>
        <div className={Styles.names_wrapper}>
          <span className={Styles.names}>
            {isLoaded ? (
              order.items.map((i) => (
                <div className={Styles.name}>{`- ${i.name}`}</div>
              ))
            ) : (
              <>
                <div className={Styles.dummy} style={{ width: "90%" }} />
                <div className={Styles.dummy} style={{ width: "70%" }} />
                <div className={Styles.dummy} style={{ width: "80%" }} />
                <div className={Styles.dummy} style={{ width: "70%" }} />
              </>
            )}
          </span>
          <span className={Styles.items_count}>
            {isLoaded && `Items: ${imgLength} products - ${count} items`}
          </span>
          <div className={Styles.buyer}>
            {isLoaded && `Buyer: ${order.user.name} - ${order.user.email}`}
          </div>
          <div className={Styles.total_amount}>
            {isLoaded && `₦${helpers.addComma(order.totalAmount)}`}
          </div>
        </div>

        <div className={Styles.details}>
          <div className={Styles.pay}>
            <>
              <div
                className={`${Styles.status} ${
                  order?.payStatus.ok ? Styles.ok : ""
                }`}
              >
                {isLoaded && order.payStatus.msg}
              </div>
              <div className={Styles.msg}>
                {isLoaded &&
                  `Paid with ${order.payMethod.split("_").join(" ")}`}
              </div>
            </>
          </div>
          <div className={Styles.order_status}>
            <>
              <div
                className={`${Styles.status} ${
                  order?.status.ok ? Styles.ok : ""
                }`}
              >
                {isLoaded &&
                  `${order.status.status} on ${order.status.createdAt}`}
              </div>
              <div className={Styles.msg}>{isLoaded && order.status.msg}</div>
            </>
          </div>

          <div className={Styles.order_id}>
            {isLoaded && (
              <>
                Order ID is <span>{order.pId}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default OrderCard;
