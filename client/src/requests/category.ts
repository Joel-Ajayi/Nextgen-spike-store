import axios from "axios";
import { cloneDeep } from "lodash";
import { makeRequest } from ".";
import filesHelper from "../helpers/files";
import { IFile, IMessage, MessageType } from "../types";
import { Category, CategoryMini } from "../types/category";

class CategoryReq {
  public async createCat(data: Category) {
    const { type, id, image, banners, ...rest } = data;
    const body = JSON.stringify({
      query: `mutation CreateCategory($data: CategoryInput){CreateCategory(data:$data){name parent type}}`,
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

    try {
      const res = await makeRequest(formData as any, true);
      return res.CreateCategory as CategoryMini;
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      } as IMessage;
    }
  }

  public async updateCat(data: Category) {
    const { type, parent, image, banners, ...rest } = data;
    const body = JSON.stringify({
      query: `mutation UpdateCategoryParent($data: CategoryUpdateInput) {
              UpdateCategory(data: $data) { name type parent } 
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

    try {
      const res = await makeRequest(formData as any, true);
      return res.UpdateCategory as CategoryMini;
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      } as IMessage;
    }
  }

  public async updateCatParent(name: string, parent: string) {
    const body = JSON.stringify({
      query: `mutation UpdateCategoryParent($name: String!, $parent: String!) {
                UpdateCategoryParent(name: $name, parent: $parent) { name type parent }
              }`,
      variables: {
        name,
        parent,
      },
    });

    try {
      const res = await makeRequest(body);
      return res.UpdateCategoryParent as CategoryMini;
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      } as IMessage;
    }
  }

  public async getCategories() {
    const body = JSON.stringify({
      query: "query GetCategories { GetCategories { name parent type } }",
    });

    try {
      const res = await makeRequest(body);
      return res.GetCategories as CategoryMini[];
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      } as IMessage;
    }
  }

  public async getCategory(name: string) {
    const body = JSON.stringify({
      query: `query GetCategory($name: String!) { GetCategory(name: $name) {
                 id name parent type description image banners filters { id name type unit options isRequired }
                }
              }`,
      variables: { name },
    });

    try {
      const res = (await makeRequest(body)).GetCategory;
      return { ...res, image: res.image ? [res.image] : [] } as any;
    } catch (err) {
      return {
        msg: (err as any)?.message,
        type: MessageType.Error,
        statusCode: (err as any)?.statusCode,
      } as IMessage;
    }
  }

  public async getImageFiles(paths: string[]) {
    const files = await Promise.all(
      paths.map(async (path) => {
        const response = await axios.get(path, {
          responseType: "blob",
        });
        const mimeType = response.headers["content-type"];
        const fileName = cloneDeep(path).split("/").pop() as string;
        const file = new File([response.data], fileName, { type: mimeType });
        const b64 = await filesHelper.getBase64String(file);
        return { file, b64 } as IFile;
      })
    );
    return files;
  }
}

const categoryReq = new CategoryReq();
export default categoryReq;
