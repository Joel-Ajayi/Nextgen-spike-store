import { APIPagination, Brand, IFile, Pagination } from ".";
import { CategoryFeature, CategoryMini, CategoryOffer } from "./category";
import { Address } from "./user";

export enum ProductsPageParams {
  SortBy = "",
}

export type ProductFormData = {
  categories: CategoryMini[];
  categoriesPath: string[];
  brands: Brand[];
  paymentTypes: {
    type: string;
    val: number;
  }[];
  featureTypes: string[];
  features: CategoryFeature[];
};

export type ProductUpdateReturn = {
  id: string;
  sku: string;
  features: ProductFeature[];
};

export type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  count: number;
  colours: string[];
  paymentType: number;
  images: (IFile | string)[];
  sku?: string;
  mfgDate: "";
  rating: number;
  numReviews: number;
  numSold: number;
  warrCovered: string;
  warrDuration: number;
  cId: number;
  brand: string;
  features: ProductFeature[];
};

export type ProductMini = {
  id: string;
  name: string;
  price: number;
  cId: number;
  brand: string;
  discount: number;
  count: number;
  rating: number;
  numReviews: number;
  numSold: number;
  images: string[];
  features: ProductFeature[];
};

export type ProductMini2 = {
  id: string;
  name: string;
  count: string;
  category: string;
  price: number;
  rating: number;
};

export enum ProductFilterSort {
  Popular = "Popular",
  Newest = "Newest",
  Price = "lowest to highest",
  Price2 = "highest to lowest",
}

export type ProductFilterRange = {
  from: number;
  to: number;
};
export interface ProductInput extends Product {
  isValid: boolean[];
  initFeatures: ProductFeature[];
}

export type InitialProductController = {
  formData: ProductFormData;
  product: ProductInput;
  list: Pagination<ProductMini2>;
};

export type ProductFeature = {
  id?: string;
  featureId: string;
  feature: string;
  value: string | number;
};

export type CatalogFilter = {
  id: string;
  name: string;
  options: string[];
  type: number;
};

export type CatalogStateAPI = {
  isCategoryChanged: boolean;
  price: string;
  offers: CategoryOffer[];
  products: APIPagination<ProductMini>;
  brands: string[];
  filters: CatalogFilter[];
};

export type CatalogStateType = {
  isParamsUpdated: boolean;
  offers: CategoryOffer[];
  products: Pagination<ProductMini | null>;
  brands: string[];
  filters: CatalogFilter[];
};

export type QueryCatalogParams = {
  skip: number;
  take: number;
  count: number;
  sortBy: string;
  brands: string[];
  category: string;
  colours: string[];
  discount: number;
  search: string;
  offer: string;
  rating: number;
  priceMax: number;
  priceMin: number;
  filters: { id: string; options: string[] }[];
};

export type Cart = {
  items: (CartItem | null)[];
  shippingAmount: number;
  subTotalAmount: number;
  totalAmount: number;
  paymentMethod: number;
  paymentMethods: string[];
  isCheckout: boolean;
};

export type CartPageData = {
  items: CartItem[];
  shippingAmount: number;
  subTotalAmount: number;
  totalAmount: number;
  paymentMethods: string[];
};

export type CartMiniItem = {
  id: string;
  qty: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  discount: number;
  count: number;
  rating: number;
  image: string;
  qty: number;
};

export type ProductReview = {
  user: string;
  title: string;
  comment: string;
  rating: number;
  date: string;
  editAble: boolean;
};

export type ProductReviews = {
  reviews: APIPagination<ProductReview>;
};

export type OrderItem = {
  id: string;
  image: string;
  qty: number;
  price: number;
  name: string;
  rating: number;
};

export type OrderUser = {
  email: string;
  name: string;
};
export type OrderStatus = {
  status: string;
  createdAt: string;
  ok: boolean;
  msg: string;
};

export interface OrderMini {
  id: string;
  createdAt: string;
  pId: string;
  user: OrderUser;
  payStatus: OrderStatus;
  status: OrderStatus;
  payMethod: string;
  items: {
    image: string;
    id: string;
    name: string;
    qty: number;
  }[];
  totalAmount: number;
}

export type Order = {
  id: string;
  pId: string;
  user: OrderUser;
  payMethod: string;
  statuses: OrderStatus[];
  payStatuses: OrderStatus[];
  address: Address;
  items: OrderItem[];
  shippingAmount: number;
  subTotalAmount: number;
  totalAmount: number;
  createdAt: string;
};
