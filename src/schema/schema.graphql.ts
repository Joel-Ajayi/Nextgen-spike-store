const typeDefs = `#graphql
type Query {
  SearchCatalog(search:String!):[SearchRes!]!
  QueryCatalog(data:CatalogInput!):CatalogResponse!
  LandingPageData:LandingPageData
  HeaderData:HeaderData
  GetBrand(name: String!): Brand
  GetBrands: [Brand!]!
  GetCategories(parent: String): [CategoryMini!]!
  GetCategory(name: String!): Category
  CategoryFormData:CategoryFormData!
  ProductFormData(id:String): CreateProductData!
  GetProductsMini2(skip:Int!, take:Int!):Pagination
  GetProduct(id: String!): Product
  GetProductMini(category: String!, id: String!): ProductMini
  QueryReviews(prd_id:String!, skip:Int!, take:Int!):Pagination!
  UserQuery: User
  GetCartItems(ids:[String!]!, qtys:[Int!]!):CartPageData!
  QueryOrders(skip:Int!, search:String!, take:Int!, isAll:Boolean!, count:Int!):Pagination!
  QueryOrder(id:String!, isAll:Boolean!):Order!
}

type Mutation {
  CreateBrand(data: BrandInput): Brand
  CreateCategory(data: CategoryInput): CategoryMini
  CreateProduct(data: ProductInput): ProductUpdateReturn
  ForgotPassword(email: String!): Message
  SignIn(data: SignInInput): Message
  SignOut: Message
  SignUp(data: SignUpInput): Message
  UpdateAddress(data:Address_I!): String!
  UpdateCategory(data: CategoryInput_U): CategoryMini
  UpdateCategoryParent(name: String!, parent: String!): CategoryMini
  UpdateProduct(data: UpdateProductInput): ProductUpdateReturn
  VerifyAccount(email: String!): Message
  VerifyPasswordToken(token: String!): Message
  VerifyToken(token: String!): Message
  UpdateReview(data:Review_I!):Message
  DeleteReview(prd_id:String!):Message
  CreateOrder(data:Order_I!):OnCreateOrder!
}

#General
type Message {
  message: String!
}

type Pagination {
  list: [AnyExceptNull!]!
  take:Int!
  skip:Int!
  count:Int!
  page:Int!
  numPages:Int!
}

# scallar type
scalar Upload
scalar UploadOrUrl
scalar AnyExceptNull
scalar StringOrInt



#Brand
type Brand {
  image: String!
  name: String!
}

input BrandInput {
  id: String!
  image: Upload!
  name: String!
}

#landing page
type LandingPageData {
  banners: [CategoryBanner!]!
  offers: [CategoryOffer!]!
  topCategories: [CategoryMini!]!
  hotDeals: [ProductMini!]!
  newProducts: [ProductMini!]!
  popularProducts: [ProductMini!]!
}

type HeaderData {
  topCategories: [CategoryMini!]!
  categories:[CategoryMicro!]!
  searchResultTypes:[Int!]!
}

type SearchRes {
  id:String!
  type:Int! #0=brand,1=cat,2=brd
  name:String!
}

#Category
type Category {
  brand: String!
  description: String!
  id: String!
  lvl: Int!
  icon:String
  name: String!
  numSold:Int!
  parent: String
  hasWarrantyAndProduction:Boolean!
  banner:CategoryBanner
  features: [CategoryFeature!]!
  offers:[CategoryOffer!]!
}

type CategoryMini {
  id:String!
  lvl: Int!
  cId: Int!
  name: String!
  parent: String!
  numSold:Int!
  icon:String
  banner:CategoryBanner
  hasWarrantyAndProduction:Boolean!
  features: [CategoryFeature!]!
  offers:[CategoryOffer!]!
}

type CategoryMicro {
  id:String!
  lvl: Int!
  cId: Int!
  name: String!
  parent: String!
  icon:String
}

type CategoryFeature {
  id: String!
  useAsFilter: Boolean!
  name: String!
  options: [String!]!
  type: Int!
}

input CategoryFeatureInput {
  id: String!
  useAsFilter: Boolean!
  name: String!
  options: [String!]!
  type: Int!
}

type CategoryOffer {
  id: String!
  type: Int!
  discount:Int!
  audience:Int!
  tagline:String!
  bannerColours:[String!]!
  image:String!
  validUntil:String!
  category:String
}

input CategoryOfferInput {
  id: String!
  type: Int!
  discount:Int!
  audience:Int!
  tagline:String!
  bannerColours:[String!]!
  image:Upload!
  validUntil:String!
}

input CategoryOfferInput_U {
  id: String!
  type: Int!
  discount:Int!
  audience:Int!
  tagline:String!
  bannerColours:[String!]!
  image:UploadOrUrl!
  validUntil:String!
}

type CategoryBanner {
  id:String!
  tagline:String!
  bannerColours:[String!]!
  image:String!
  category:String
}

input CategoryBannerInput {
  tagline:String!
  bannerColours:[String!]!
  image:Upload!
}

input CategoryBannerInput_U {
  tagline:String!
  bannerColours:[String!]!
  image:UploadOrUrl!
}

input CategoryInput {
  brand: String
  icon:Upload
  description: String
  banner:CategoryBannerInput
  features: [CategoryFeatureInput!]!
  offers:[CategoryOfferInput!]!
  hasWarrantyAndProduction: Boolean!
  name: String!
  parent: String
}

input CategoryInput_U {
  brand: String!
  icon:UploadOrUrl
  description: String
  features: [CategoryFeatureInput!]!
  offers:[CategoryOfferInput_U!]!
  hasWarrantyAndProduction:Boolean!
  banner:CategoryBannerInput_U
  id: String!
  name: String!
}

type CategoryFormData {
  brands: [Brand!]!
  offerTypes: [String!]!
  featureTypes: [String!]!
  offerAudiences:[String!]!
}

#Product
input CatalogInput {
  skip:Int!
  take:Int!
  count:Int!
  category: String
  colours: [String!]!
  search:String
  offer:String
  brands: [String!]!
  sortBy: CatalogSort
  priceMax: Float
  priceMin:Float
  discount: Int
  rating: Int
  filters: [CatalogFilterInput!]!
}

input CatalogFilterInput {
  id: String!
  options: [String!]!
}

type CatalogFilter {
  id:String!
  name: String!
  options: [String!]!
}

type CatalogResponse {
  offers:[CategoryOffer!]!
  products:Pagination
  brands:[String!]!
  filters:[CatalogFilter!]!
}

enum CatalogSort {
  popular
  newest
  hotdeals
  price_desc
  price_asc
  rating
}

type Product {
  id: String!
  name: String!
  price: Int!
  numReviews:Int!
  rating: Int!
  brand: String!
  cId: Int!
  count:Int!
  description: String!
  discount: Int!
  colours: [String!]!
  paymentType: Int!
  numSold:Int!
  images: [String!]!
  sku:String!
  mfgDate: String
  warrCovered: String
  warrDuration: Int
  features: [ProductFeature!]!
}

type ProductMini {
  brand: String
  category: String
  discount: Int!
  id: String!
  images: [String!]!
  name: String!
  price: Int!
  count: Int!
  numSold:Int!
  numReviews:Int!
  rating: Int!
}

type ProductUpdateReturn {
  id:String!
  sku:String!
  features:[ProductFeature!]!
}

input ProductInput {
  brand: String!
  cId: Int!
  colours: [String!]!
  count: Int!
  description: String!
  discount: Int
  images: [Upload!]!
  name: String!
  paymentType: Int!
  price: Int!
  mfgDate: String
  warrCovered: String
  warrDuration: Int
  features: [ProductFeatureInput!]!
}

input UpdateProductInput {
  id: String!
  name: String
  cId: Int
  brand:String
  description: String
  price: Int
  discount: Int
  colours: [String!]!
  count: Int
  paymentType: Int
  images: [Upload!]
  mfgDate: String
  warrCovered: String
  warrDuration: Int
  features: [ProductFeatureInput!]
}

type ProductFeature {
  id: String!
  featureId: String!
  value: String!
  feature:String!
}

input ProductFeatureInput {
  id: String
  featureId: String!
  value: String!
}

type CreateProductData {
  brands: [Brand]!
  categories: [CategoryMini]!
  paymentTypes: [PaymentType!]!
  categoriesPath:[String]!
  featureTypes:[String!]!
  features:[CategoryFeature!]!
}

type PaymentType {
  val:Int!
  type:String!
}

input Review_I {
  prd_id: String!
  comment: String!
  title:String!
  rating: Int!
}

type CartPageData {
  items:[CartItem!]!
  shippingAmount: Int!
  subTotalAmount: Int!
  totalAmount: Int!
  paymentMethods:[String!]!
}

type CartItem {
  id: String!
  name: String!
  price: Int!
  discountPrice:Int!
  rating: Int!
  count:Int!
  discount: Int!
  image: String!
  qty:Int!
}


#User
type User {
  avatar: String!
  contactNumber: String
  email: String!
  fName: String
  id: ID!
  lName: String
  roles: [Int!]!
  addresses:[Address!]!
  addressTypes:[String!]!
  states:[State!]!
}

type State {
  name:String!
  cities:[City!]!
}

type City {
  name:String!
  localities:[String!]!
}

input SignInInput {
  email: String
  pwd: String
}

input SignUpInput {
  email: String!
  fName: String!
  lName: String!
  pwd: String!
}

type Address {
  id: String!
  name: String!
  state: String!
  city: String!
  locality: String!
  address: String!
  addressType: Int!
  isNew:Boolean!
  tel: String!
}

input Address_I {
    id: String!
    name: String!
    state: String!
    city: String!
    locality: String!
    address: String!
    addressType: Int!
    tel: String!
}


  type Order {
    id:String!
    pId:String!
    user:OrderUser!
    payMethod:String!
    statuses:[OrderStatus!]!
    payStatuses:[OrderStatus!]!
    items:[OrderItem!]!
    address:Address!
    subTotalAmount: Int!
    shippingAmount:Int!
    totalAmount: Int!
    createdAt:String!
  }

  type OrderItem {
    id:String!
    image:String!
    qty:Int!
    price:Int!
    name:String!
    rating:Int!
  }


  type OnCreateOrder {
    orderId:String!
    access_code:String!
  }

  input Order_I {
    shippingAddress:String!
    paymentMethod:Int!
    itemIds:[String!]!
    itemQtys:[Int!]!
  }

  type OrderUser {
    email:String!
    name:String!
  }

  type OrderStatus {
    status:String!
    createdAt:String!
    ok:Boolean!
    msg:String!
  }
`;

export default typeDefs;
