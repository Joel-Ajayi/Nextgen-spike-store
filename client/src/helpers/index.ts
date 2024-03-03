class Helpers {
  public reduceNumberLenth(price: number) {
    console.log(price);
    if (price > 1000) {
      if (price > 1000000) {
        return `${(price / 1000000).toFixed(2)}M`;
      }
      return `${(price / 1000).toFixed(2)}K`;
    }
    return price.toFixed(2);
  }
}

const helpers = new Helpers();
export default helpers;
