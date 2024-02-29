import request from ".";
import { LandingPageData } from "../types";

class GlobalReq {
  public async getLandingPageData() {
    const body = JSON.stringify({
      query: `
    query LandingPageData {
        LandingPageData {
          banners { id tagline bannerColours image }
          offers { id type discount tagline bannerColours image }
          topCategories { name icon }
          hotDeals { brand category discount id images name price numSold numReviews rating }
          newProducts { brand category discount id images name price numSold numReviews rating }
          popularProducts { brand category discount id images name price numSold numReviews rating }
          
        }
      }
    `,
    });
    const res = await request.makeRequest<LandingPageData>(body);
    return res;
  }
}

const globalReq = new GlobalReq();
export default globalReq;
