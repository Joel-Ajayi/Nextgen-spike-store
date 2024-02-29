import request from ".";
import { Brand, IFile } from "../types";

class BrandReq {
  public async getBrand(name: string) {
    const body = JSON.stringify({
      query: `query GetBrand($name: String!) { GetBrand(name: $name) { name image }}`,
      variables: { name },
    });

    const res = await request.makeRequest<Brand>(body);
    return res;
  }

  public async updateBrd(data: Brand) {
    const body = JSON.stringify({
      query: `mutation CreateBrand($data: BrandInput) { CreateBrand(data: $data) { name image } }`,
      variables: { data: { ...data, image: null } },
    });

    const formData = new FormData();
    formData.append("operations", body);
    let map = { "0": ["variables.data.image"] };
    formData.append("map", JSON.stringify(map));
    formData.append("0", (data.image[0] as IFile).file);

    const res = await request.makeRequest<Brand>(formData as any, true);
    return res;
  }

  public async getBrands() {
    const body = JSON.stringify({
      query: "query GetBrands { GetBrands { name image } }",
    });

    const res = await request.makeRequest<Brand[]>(body);
    return res;
  }
}

const brandReq = new BrandReq();
export default brandReq;
