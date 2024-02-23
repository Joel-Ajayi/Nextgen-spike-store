import { IFile } from "../types";
import { Category, CategoryFormData, CategoryMini } from "../types/category";
import request from ".";

class CategoryReq {
  public async updateCat(data: Category, isUpdate = false) {
    const { banner, parent, lvl, offers, ...rest } = data;
    const returnData = `
    name parent lvl cId icon
    offers { id type validUntil image tagline bannerColours discount audience }
    features { id name type options useAsFilter parentId}`;

    const input = {
      ...rest,
      icon: null,
      parent: isUpdate ? undefined : parent,
      banner: banner ? { ...banner, image: null } : null,
      offers: offers.map((f) => ({ ...f, image: null })),
    } as Category;

    const createQuery = `mutation CreateCategory($data: CategoryInput) { CreateCategory(data:$data) { ${returnData} }}`;
    const updateQuery = `mutation UpdateCategory($data: CategoryInput_U) { UpdateCategory(data: $data) { ${returnData} } }`;

    const formData = new FormData();
    let map: { [key in string]: string[] } = {};
    let addedNumFiles = 0;
    const images: File[] = [];

    if (data?.icon) {
      const file = data.icon as IFile;
      if (file.baseUrl) {
        input.icon = file.src;
      } else {
        map["0"] = ["variables.data.icon"];
        images.push(file.file);
        addedNumFiles += 1;
      }
    }

    if (input.banner && banner) {
      const file = banner.image as IFile;
      if (file.baseUrl) {
        input.banner.image = file.src;
      } else {
        map[`${addedNumFiles}`] = ["variables.data.banner.image"];
        images.push((banner.image as IFile).file);
        addedNumFiles += 1;
      }
    }

    data.offers.forEach(({ image }, i) => {
      const file = image as IFile;
      if (file.baseUrl) {
        input.offers[i].image = file.src;
      } else {
        map[addedNumFiles] = [`variables.data.offers.${i}.image`];
        images.push(file.file);
        addedNumFiles += 1;
      }
    });

    const body = JSON.stringify({
      query: !isUpdate ? createQuery : updateQuery,
      variables: { data: input },
    });

    let requestData: FormData | string = body;
    if (!!addedNumFiles) {
      formData.append("operations", body);
      formData.append("map", JSON.stringify(map));
      images.forEach((file, i) => {
        formData.append(`${i}`, file);
      });
      requestData = formData;
    }

    const { res, msg } = await request.makeRequest<CategoryMini>(
      requestData,
      !!addedNumFiles
    );
    return { cat: res, msg };
  }

  public async updateCatParent(name: string, parent: string) {
    const body = JSON.stringify({
      query: `mutation UpdateCategoryParent($name: String!, $parent: String!) {
                UpdateCategoryParent(name: $name, parent: $parent) { 
                name parent lvl cId icon
                offers { id type validUntil image tagline bannerColours discount audience}
                features { id name type options useAsFilter parentId} }
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
      query: `query GetCategories($parent:String) { GetCategories(parent: $parent) { 
          name parent lvl cId icon hasWarrantyAndProduction
          banner { image tagline bannerColours }  
          offers { id type validUntil image tagline bannerColours discount audience}
          features { id name type options useAsFilter parentId} } }`,
      variables: { parent },
    });

    const { res, msg } = await request.makeRequest<CategoryMini[]>(body);
    return { cats: res, msg };
  }

  public async getCategory(name: string) {
    const body = JSON.stringify({
      query: `query GetCategory($name: String!) { GetCategory(name: $name) {
                 id name parent lvl description hasWarrantyAndProduction brand icon
                 banner { image tagline bannerColours } 
                 offers { id type validUntil image tagline bannerColours discount audience }
                 features { id name type options useAsFilter parentId }
                }
              }`,
      variables: { name },
    });

    const { res, msg } = await request.makeRequest<Category>(body);
    return { cat: res, msg };
  }

  public async getCategoryFormData() {
    const body = JSON.stringify({
      query: `query CategoryFormData { CategoryFormData { brands { name image } offerTypes featureTypes offerAudiences }}`,
    });

    const { res, msg } = await request.makeRequest<CategoryFormData>(body);
    return { data: res, msg };
  }
}

const categoryReq = new CategoryReq();
export default categoryReq;
