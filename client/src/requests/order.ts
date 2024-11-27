import request from ".";
import helpers from "../helpers";
import { APIPagination } from "../types";
import { Order, OrderItem, OrderMini } from "../types/product";

class OrdersReq {
  public async createOrder(
    address: string,
    payment: number,
    ids: string[],
    qtys: number[]
  ) {
    let query = `mutation CreateOrder($data:Order_I!) {
          CreateOrder(data:$data) { orderId access_code }
        }`;
    const body = JSON.stringify({
      query,
      variables: {
        data: {
          shippingAddress: address,
          paymentMethod: payment,
          itemIds: ids,
          itemQtys: qtys,
        },
      },
    });

    const res = await request.makeRequest<{
      access_code: string;
      orderId: string;
    }>(body);
    return res;
  }

  public async getOrder(id: string, isAll = false) {
    let query = `query QueryOrder($id:String!, $isAll:Boolean!) {
            QueryOrder(id:$id, isAll:$isAll) { 
                id pId payMethod payMethod subTotalAmount shippingAmount totalAmount createdAt
                user { email name }
                payStatuses { status createdAt ok msg } 
                statuses { status createdAt ok msg }
                items { id image qty price name rating }
                address { tel address id name state city locality addressType}
             }
          }`;

    const body = JSON.stringify({
      query,
      variables: { id, isAll },
    });

    const res = await request.makeRequest<Order>(body);
    return res;
  }

  public async getOrders(
    skip: number,
    search: string,
    take: number,
    isAll: boolean,
    count: number
  ) {
    let query = `query QueryOrders($skip:Int!, $search:String!, $take:Int!, $isAll:Boolean!, $count:Int!) {
        QueryOrders(skip:$skip, search:$search, take:$take, isAll:$isAll, count:$count) { 
            take count list skip page numPages
        }
      }`;

    const body = JSON.stringify({
      query,
      variables: { skip, isAll, search, take, count },
    });

    const res = await request.makeRequest<APIPagination<OrderMini>>(body);
    return res;
  }
}

const ordersReq = new OrdersReq();
export default ordersReq;
