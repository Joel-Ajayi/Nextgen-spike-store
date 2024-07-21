import { IFile } from "../types";
import { Category, CategoryFormData, CategoryMini } from "../types/category";
import request from ".";

class CategoryReq {
  public async updateCat(data: Category, isUpdate = false) {
    const { banner, parent, lvl, offers, ...rest } = data;
    const returnData = `
    name parent lvl cId icon
    offers { id type validUntil image tagline bannerColours discount audience }
    features { id name type options useAsFilter }`;

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

    const res = await request.makeRequest<CategoryMini>(
      requestData,
      !!addedNumFiles
    );
    return res;
  }

  public async updateCatParent(name: string, parent: string) {
    const body = JSON.stringify({
      query: `mutation UpdateCategoryParent($name: String!, $parent: String!) {
                UpdateCategoryParent(name: $name, parent: $parent) { 
                name parent lvl cId icon
                offers { id type validUntil image tagline bannerColours discount audience}
                features { id name type options useAsFilter} }
              }`,
      variables: {
        name,
        parent,
      },
    });

    const res = await request.makeRequest<CategoryMini>(body);
    return res;
  }

  public async getCategories(parent = "") {
    const body = JSON.stringify({
      query: `query GetCategories($parent:String) { GetCategories(parent: $parent) { 
          name parent lvl cId icon hasWarrantyAndProduction
          banner { image tagline bannerColours }  
          offers { id type validUntil image tagline bannerColours discount audience}
          features { id name type options useAsFilter} } }`,
      variables: { parent },
    });

    const res = await request.makeRequest<CategoryMini[]>(body);
    return res;
  }

  public async getCategory(name: string) {
    const body = JSON.stringify({
      query: `query GetCategory($name: String!) { GetCategory(name: $name) {
                 id name parent lvl description hasWarrantyAndProduction brand icon
                 banner { image tagline bannerColours } 
                 offers { id type validUntil image tagline bannerColours discount audience }
                 features { id name type options useAsFilter }
                }
              }`,
      variables: { name },
    });

    const res = await request.makeRequest<Category>(body);
    return res;
  }

  public async getCategoryFormData() {
    const body = JSON.stringify({
      query: `query CategoryFormData { CategoryFormData { brands { name image } offerTypes featureTypes offerAudiences }}`,
    });

    const res = await request.makeRequest<CategoryFormData>(body);
    return res;
  }
}

const categoryReq = new CategoryReq();
export default categoryReq;
