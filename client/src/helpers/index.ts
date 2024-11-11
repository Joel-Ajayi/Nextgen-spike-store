import { Pagination } from "../types";
import { CartMiniItem } from "../types/product";

class Helpers {
  public reduceNumLength(price: number) {
    if (price > 1000) {
      if (price > 1000000) {
        return `${(price / 1000000).toFixed(2)}M`;
      }
      return `${(price / 1000).toFixed(2)}K`;
    }
    return price.toFixed(2);
  }

  public addToCart(id: string, qty = 1) {
    let items = JSON.parse(
      localStorage.getItem("cart_items") ?? JSON.stringify([])
    ) as CartMiniItem[];
    let itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      const newQty = items[itemIndex].qty + qty;
      if (newQty <= 0) {
        this.deleteCartItem(id);
        return { id: "", qty: 0 };
      }
      items[itemIndex] = { id, qty: newQty };
    } else {
      itemIndex = items.length;
      items[items.length] = { id, qty };
    }
    localStorage.setItem("cart_items", JSON.stringify(items));
    return items[itemIndex];
  }

  public deleteCartItem(id: string) {
    const items = this.getCart().filter((i) => i.id !== id);
    localStorage.setItem("cart_items", JSON.stringify(items));
    return items;
  }

  public getCart() {
    return JSON.parse(
      localStorage.getItem("cart_items") ?? "[]"
    ) as CartMiniItem[];
  }

  public getCartItem(id: string) {
    return this.getCart().find((item) => item.id === id) || { id: "", qty: 0 };
  }

  public addComma(price: number) {
    return price
      .toFixed(0)
      .toLocaleString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  public getStateByPath<T>(state: any, path: string) {
    return path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
        state
      ) as Pagination<T>;
  }
}

const helpers = new Helpers();
export default helpers;
