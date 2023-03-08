import { makeRequest } from ".";
import { MessageType } from "../types";
import { Category, CategoryMini } from "../types/category";

class CategoryReq {
  public async createCat(data: Category) {
    const body = JSON.stringify({
      query: `mutation CreateCategory($data: CategoryInput){CreateCategory(data:$data){name parent type}}`,
      variables: {
        data: { ...data, image: null, banners: data.banners.map(() => null) },
      },
    });

    const formData = new FormData();
    formData.append("operations", body);
    let map: { [key in string]: string[] } = { 0: ["variables.data.image"] };
    data.banners.forEach((_, i) => {
      map[i + 1] = [`variables.data.banners.${i}`];
    });
    formData.append("map", JSON.stringify(map));
    formData.append("0", data.image[0] as File);
    data.banners.forEach((file, i) => {
      formData.append(`${i + 1}`, file as File);
    });

    try {
      const res = await makeRequest(formData as any, true);
      return res.CreateCategory as CategoryMini;
    } catch (err) {
      return { msg: (err as any)?.message, type: MessageType.Error };
    }
  }

  public async getCategories() {
    const body = JSON.stringify({
      query: "query GetCategories { GetCategories { name parent } }",
    });

    try {
      const res = await makeRequest(body, true);
      return res.GetCategories as Category[];
    } catch (err) {
      return { msg: (err as any)?.message, type: MessageType.Error };
    }
  }

  public async getCategory(name: string) {
    const body = JSON.stringify({
      query: `query GetCategory($name: String!) { GetCategory(name: $name) {
                 id name parent description image banners filters { id name type unit options isRequired }
                }
              }`,
      variables: { name },
    });

    try {
      const res = await makeRequest(body);
      return res.GetCategory as Category;
    } catch (err) {
      return { msg: (err as any)?.message, type: MessageType.Error };
    }
  }
}

const categoryReq = new CategoryReq();
export default categoryReq;
