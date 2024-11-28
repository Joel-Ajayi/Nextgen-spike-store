import React from "react";

type Props = {
  isController?: boolean;
};
function Order({ isController = false }: Props) {
  return <div>Order</div>;
}

export default Order;
