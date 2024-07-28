import { AppState } from "../store";
import { Pagination } from "../types";

class Helpers {
  public reduceNumberLenth(price: number) {
    if (price > 1000) {
      if (price > 1000000) {
        return `${(price / 1000000).toFixed(2)}M`;
      }
      return `${(price / 1000).toFixed(2)}K`;
    }
    return price.toFixed(2);
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
