import request from ".";
import { APIPagination, IFile, Message, Pagination } from "../types";
import {
  Product,
  ProductFilter,
  ProductFormData,
  ProductInput,
  ProductMini,
  ProductMini2,
  ProductUpdateReturn,
  productFilterReturn as ProductFilterReturn,
  QueryCatalogParams,
  CatalogStateAPI,
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
    const { isValid, initFeatures, ...rest } = data;
    const variables = {
      data: {
        ...rest,
        features: rest.features.filter((f) => f !== null),
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
        mfgDate warrDuration warrCovered features { id value featureId }
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
}

const productReq = new ProductReq();
export default productReq;
