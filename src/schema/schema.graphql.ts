const typeDefs = `#graphql
type Query {
  SearchGlobal(search:String!):[SearchRes!]!
  FilterProducts(query:ProductsFilterInput!):[ProductMini!]!
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
  UserQuery: User
}

type Mutation {
  CreateBrand(data: BrandInput): Brand
  CreateCategory(data: CategoryInput): CategoryMini
  CreateProduct(data: ProductInput): ProductUpdateReturn
  ForgotPassword(email: String!): Message
  SignIn(data: SignInInput): Message
  SignOut: Message
  SignUp(data: SignUpInput): Message
  UpdateCategory(data: CategoryInput_U): CategoryMini
  UpdateCategoryParent(name: String!, parent: String!): CategoryMini
  UpdateProduct(data: UpdateProductInput): ProductUpdateReturn
  VerifyAccount(email: String!): Message
  VerifyPasswordToken(token: String!): Message
  VerifyToken(token: String!): Message
}

#General
type Message {
  message: String!
}

type Pagination {
  list: [[AnyExceptNull!]]!
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

type CategoryOfferMini {
  id:String!
  name: String!
  options: [String!]!
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
input ProductsFilterInput {
  isFirstCall:Boolean!
  skip: Int!
  take:Int!
  category: String
  brands: [String!]!
  colours: [String!]!
  sortBy: ProductFilterSort
  price: ProductFilterRange
  offers: [String!]!
  discount: ProductFilterRange
  rating: ProductFilterRange
  filters: [ProductFeatureInput!]!
}

type ProductFilterReturn {
  offers:[String!]!
  products:Pagination!
  brands:[String!]!
  filters:[CategoryOfferMini!]!
  colours: [String!]!
}

input ProductFilterRange {
  from:Int!
  to:Int!
}

enum ProductFilterSort {
  Popular
  Newest
  lowest_to_highest
  highest_to_lowest
}

type Product {
  id: String!
  name: String!
  price: Int!
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
  colours: [String!]
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


#User
type User {
  avatar: String!
  contactNumber: String
  email: String!
  fName: String
  id: ID!
  lName: String
  roles: [Int!]!
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
`;

export default typeDefs;
