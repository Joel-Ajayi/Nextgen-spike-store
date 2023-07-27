import request from ".";
import { Brand, IFile } from "../types";

class BrandReq {
  public async getBrand(name: string) {
    const body = JSON.stringify({
      query: `query GetBrand($name: String!) { GetBrand(name: $name) { name image }}`,
      variables: { name },
    });

    const { res, msg } = await request.makeRequest<Brand>(body);
    return { brd: res, msg };
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

    const { res, msg } = await request.makeRequest<Brand>(
      formData as any,
      true
    );
    return { brd: res, msg };
  }

  public async getBrands() {
    const body = JSON.stringify({
      query: "query GetBrands { GetBrands { name image } }",
    });

    const { res, msg } = await request.makeRequest<Brand[]>(body);
    return { brds: res, msg };
  }
}

const brandReq = new BrandReq();
export default brandReq;
