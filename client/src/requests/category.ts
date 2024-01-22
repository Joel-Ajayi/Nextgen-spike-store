import { IFile } from "../types";
import { Category, CategoryMini } from "../types/category";
import request from ".";

class CategoryReq {
  public async updateCat(data: Category, isUpdate = false) {
    const { lvl, parent, image, banners, ...rest } = data;
    const createQuery = `mutation CreateCategory($data: CategoryInput) { CreateCategory(data:$data) { name parent lvl } }`;
    const updateQuery = `mutation UpdateCategory($data: CategoryUpdateInput) { UpdateCategory(data: $data) { name lvl parent } }`;
    const body = JSON.stringify({
      query: !isUpdate ? createQuery : updateQuery,
      variables: {
        data: { ...rest, image: null, banners: banners.map(() => null) },
      },
    });

    const formData = new FormData();
    formData.append("operations", body);
    let map: { [key in string]: string[] } = {};
    if (image.length) map["0"] = ["variables.data.image"];
    data.banners.forEach((_, i) => {
      map[i + (!image.length ? 0 : 1)] = [`variables.data.banners.${i}`];
    });
    formData.append("map", JSON.stringify(map));

    if (image.length) formData.append("0", (data.image[0] as IFile).file);

    (data.banners as IFile[]).forEach(({ file }, i) => {
      formData.append(`${i + (!image.length ? 0 : 1)}`, file);
    });

    const { res, msg } = await request.makeRequest<CategoryMini>(
      formData,
      true
    );
    return { cat: res, msg };
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

  public async getCategories(parent = "") {
    const body = JSON.stringify({
      query:
        "query GetCategories($parent:String) { GetCategories(parent: $parent) { name parent lvl image cId hasWarrantyAndProduction features { id name type options useAsFilter parentId} } }",
      variables: { parent },
    });

    const { res, msg } = await request.makeRequest<CategoryMini[]>(body);
    return { cats: res, msg };
  }

  public async getCategory(name: string) {
    const body = JSON.stringify({
      query: `query GetCategory($name: String!) { GetCategory(name: $name) {
                 id name parent lvl description image banners hasWarrantyAndProduction brand features { id name type options useAsFilter parentId }
                }
              }`,
      variables: { name },
    });

    const { res, msg } = await request.makeRequest<Category>(body);
    return { cat: res, msg };
  }
}

const categoryReq = new CategoryReq();
export default categoryReq;
