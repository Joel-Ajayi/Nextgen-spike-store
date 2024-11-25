import request from ".";
import helpers from "../helpers";
import { APIPagination, IFile } from "../types";
import {
  Product,
  ProductFormData,
  ProductInput,
  ProductMini2,
  ProductUpdateReturn,
  QueryCatalogParams,
  CatalogStateAPI,
  ProductReview,
  CartPageData,
} from "../types/product";

class ProductReq {
  public async getProductFormData(id?: string) {
    const body = JSON.stringify({
      query: `query ProductFormData($id: String) {
        ProductFormData(id: $id) { 
                  brands { name image }
                  categories { id name lvl parent icon cId hasWarrantyAndProduction features { id name type options useAsFilter } }
                  paymentTypes { type val }
                  categoriesPath
                  featureTypes
                  features { id name type options useAsFilter }
                }
              }`,
      variables: { id },
    });

    const res = await request.makeRequest(body);
    return res as ProductFormData;
  }

  public async updateProduct(isUpdate: boolean, data: ProductInput) {
    const apiReturn = "id sku features { id featureId value }";
    const newQuery = `mutation CreateProduct($data: ProductInput) { CreateProduct(data:$data) { ${apiReturn} } }`;
    const updateQuery = `mutation UpdateProduct($data: UpdateProductInput) { UpdateProduct(data:$data) { ${apiReturn} } }`;
    const query = isUpdate ? updateQuery : newQuery;
    const { isValid, initFeatures, numReviews, numSold, sku, rating, ...rest } =
      data;
    const variables = {
      data: {
        ...rest,
        features: rest.features.map(({ feature, ...f }) => f),
        images: data.images.map(() => null),
      },
    };

    const body = JSON.stringify({ query, variables });
    const formData = new FormData();
    formData.append("operations", body);
    let map: { [key in string]: string[] } = {};
    data.images.forEach((_, i) => {
      map[i] = [`variables.data.images.${i}`];
    });
    formData.append("map", JSON.stringify(map));
    (data.images as IFile[]).forEach(({ file }, i) => {
      formData.append(`${i}`, file);
    });
    const res = await request.makeRequest<ProductUpdateReturn>(formData, true);
    return res;
  }

  public async getProduct(id: string) {
    let query = `query GetProduct($id: String!) {
      GetProduct(id: $id) { 
        id name cId images discount brand colours sku paymentType price count description
        mfgDate warrDuration warrCovered numSold numReviews rating features { id value featureId feature }
       }
    }`;

    const body = JSON.stringify({ query, variables: { id } });

    const res = await request.makeRequest<Product>(body);
    return res;
  }

  public async getProductsMini2(skip: number, take: number) {
    const query = `query GetProductsMini2($skip:Int!, $take:Int!) {
      GetProductsMini2(skip:$skip, take:$take) { take count list skip page numPages }
    }`;

    const body = JSON.stringify({ query, variables: { skip, take } });
    const res = await request.makeRequest<APIPagination<ProductMini2>>(body);
    return res;
  }

  public async getReviews(prd_id: string, skip: number, take: number) {
    const query = `query QueryReviews($prd_id:String!, $skip:Int!, $take:Int!) {
      QueryReviews(prd_id:$prd_id, skip:$skip, take:$take) { take count list skip page numPages }
    }`;

    const body = JSON.stringify({ query, variables: { prd_id, skip, take } });
    return await request.makeRequest<APIPagination<ProductReview>>(body);
  }

  public async updateReview(
    prd_id: string,
    title: string,
    rating: number,
    comment: string
  ) {
    const query = `mutation UpdateReview($data:Review_I!) { 
        UpdateReview(data:$data) { message }
    }`;
    const body = JSON.stringify({
      query,
      variables: { data: { prd_id, title, rating, comment } },
    });
    await request.makeRequest<string>(body);
  }

  public async deleteReview(prd_id: string) {
    const query = `mutation DeleteReview($prd_id:String!) { 
      DeleteReview(prd_id:$prd_id) { message }
  }`;
    const body = JSON.stringify({
      query,
      variables: { prd_id },
    });
    await request.makeRequest<string>(body);
  }

  public async queryCatalog(filters: QueryCatalogParams) {
    let query = `query QueryCatalog($data:CatalogInput!) {
      QueryCatalog(data:$data) { 
        offers {id type validUntil image tagline bannerColours discount audience}
        brands 
        products { take count list skip page numPages } 
        filters { id name options }
      }
    }`;

    const body = JSON.stringify({ query, variables: { data: filters } });
    const res = await request.makeRequest<CatalogStateAPI>(body);
    return res;
  }

  public async getCart() {
    const items = helpers.getCart();
    let query = `query GetCartItems($ids:[String!]!, $qtys:[Int!]!) {
      GetCartItems(ids:$ids, qtys:$qtys) { 
       shippingAmount subTotalAmount totalAmount paymentMethods
       items { id name price discountPrice rating count discount image qty }
      }
    }`;
    const body = JSON.stringify({
      query,
      variables: { ids: items.map((i) => i.id), qtys: items.map((i) => i.qty) },
    });
    const res = await request.makeRequest<CartPageData>(body);
    return res;
  }

  public async createOrder(
    address: string,
    payment: number,
    ids: string[],
    qtys: number[]
  ) {
    const items = helpers.getCart();
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
}

const productReq = new ProductReq();
export default productReq;
