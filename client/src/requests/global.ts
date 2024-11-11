import request from ".";
import { HeaderData, LandingPageData, SearchResponse } from "../types";

class GlobalReq {
  public async getLandingPageData() {
    const body = JSON.stringify({
      query: `
    query LandingPageData {
        LandingPageData {
          banners { id tagline bannerColours image category}
          offers { id type discount tagline bannerColours image category}
          topCategories { name icon }
          hotDeals { brand category discount id images name price numSold numReviews rating count }
          newProducts { brand category discount id images name price numSold numReviews rating count }
          popularProducts { brand category discount id images name price numSold numReviews rating count }
        }
      }
    `,
    });
    const res = await request.makeRequest<LandingPageData>(body);
    return res;
  }

  public async getHeaderData() {
    const body = JSON.stringify({
      query: `
      query HeaderData {
        HeaderData {
          topCategories { name icon }
          categories { id lvl cId name parent icon }
          searchResultTypes
        }
      }
    `,
    });
    const res = await request.makeRequest<HeaderData>(body);
    return res;
  }

  public async Search(search: string) {
    const body = JSON.stringify({
      query: `query SearchCatalog($search: String!) {
       SearchCatalog(search: $search) { name type id }
      }`,
      variables: { search },
    });
    const res = await request.makeRequest<SearchResponse[]>(body);
    return res;
  }
}

const globalReq = new GlobalReq();
export default globalReq;
