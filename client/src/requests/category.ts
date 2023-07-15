import { IMessage, MessageType } from "../types";
import { Category, CategoryMini } from "../types/category";
import request from ".";

class CategoryReq {
  public async createCat(data: Category) {
    const { lvl, id, image, banners, ...rest } = data;
    const body = JSON.stringify({
      query: `mutation CreateCategory($data: CategoryInput){CreateCategory(data:$data){name parent lvl}}`,
      variables: {
        data: { ...rest, image: null, banners: banners.map(() => null) },
      },
    });

    const formData = new FormData();
    formData.append("operations", body);
    let map: { [key in string]: string[] } = {};
    if (image.length) {
      map["0"] = ["variables.data.image"];
    }
    data.banners.forEach((_, i) => {
      map[i + (!image.length ? 0 : 1)] = [`variables.data.banners.${i}`];
    });
    formData.append("map", JSON.stringify(map));
    if (image.length) {
      formData.append("0", data.image[0].file as File);
    }
    data.banners.forEach(({ file }, i) => {
      formData.append(`${i + (!image.length ? 0 : 1)}`, file as File);
    });

    const { res, msg } = await request.makeRequest(formData as any, true);
    return { cat: res as CategoryMini, msg };
  }

  public async updateCat(data: Category) {
    const { lvl, parent, image, banners, ...rest } = data;
    const body = JSON.stringify({
      query: `mutation UpdateCategory($data: CategoryUpdateInput) {
              UpdateCategory(data: $data) { name lvl parent } 
             }`,
      variables: {
        data: { ...rest, image: null, banners: banners.map(() => null) },
      },
    });

    const formData = new FormData();
    formData.append("operations", body);
    let map: { [key in string]: string[] } = {};
    if (image.length) {
      map["0"] = ["variables.data.image"];
    }
    data.banners.forEach((_, i) => {
      map[i + (!image.length ? 0 : 1)] = [`variables.data.banners.${i}`];
    });
    formData.append("map", JSON.stringify(map));
    if (image.length) {
      formData.append("0", data.image[0].file as File);
    }
    data.banners.forEach(({ file }, i) => {
      formData.append(`${i + (!image.length ? 0 : 1)}`, file as File);
    });

    const { res, msg } = await request.makeRequest(formData as any, true);
    return { cat: res as CategoryMini, msg };
  }

  public async updateCatParent(name: string, parent: string) {
    const body = JSON.stringify({
      query: `mutation UpdateCategoryParent($name: String!, $parent: String!) {
                UpdateCategoryParent(name: $name, parent: $parent) { name lvl parent }
              }`,
      variables: {
        name,
        parent,
      },
    });

    const { res, msg } = await request.makeRequest(body);
    return { cat: res as CategoryMini, msg };
  }

  public async getCategories() {
    const body = JSON.stringify({
      query: "query GetCategories { GetCategories { name parent lvl } }",
    });

    const { res, msg } = await request.makeRequest(body);
    return { cats: res as CategoryMini[], msg };
  }

  public async getCategory(name: string) {
    const body = JSON.stringify({
      query: `query GetCategory($name: String!) { GetCategory(name: $name) {
                 id name parent lvl description image banners hasWarranty filters { id name type unit options isRequired }
                }
              }`,
      variables: { name },
    });

    const { res, msg } = await request.makeRequest(body);
    return {
      cat: { ...res, image: res.image ? [res.image] : [] } as Category,
      msg,
    };
  }
}

const categoryReq = new CategoryReq();
export default categoryReq;
