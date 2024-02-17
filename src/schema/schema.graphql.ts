const typeDefs = `#graphql
type Query {
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
  UpdateCategory(data: CategoryUpdateInput): CategoryMini
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
  list: [AnyExceptNull!]!
  take:Int!
  skip:Int!
  count:Int!
  page:Int!
  numPages:Int!
}

# scallar type
scalar Upload
scalar StringAndInt
scalar AnyExceptNull

#Brand
type Brand {
  image: [String!]!
  name: String!
}

input BrandInput {
  id: String!
  image: Upload!
  name: String!
}



#Category
type Category {
  brand: String!
  description: String!
  features: [CategoryFeature!]!
  offers:[CategoryOffer!]!
  hasWarrantyAndProduction:Boolean!
  id: String!
  image: [String!]!
  lvl: Int!
  name: String!
  parent: String
}

type CategoryFeature {
  id: String!
  useAsFilter: Boolean!
  parentId: String
  name: String!
  options: [String!]!
  type: Int!
}

input CategoryFeatureInput {
  id: String!
  useAsFilter: Boolean!
  parentId: String
  name: String!
  options: [String!]!
  type: Int!
}

type CategoryOffer {
  id: String!
  type: Int!
  discount:Int!
  audience:Int!
  banner:String!
  validUntil:String!
}

input CategoryOfferInput {
  id: String!
  type: Int!
  discount:Int!
  audience:Int!
  banner:Upload!
  validUntil:String!
}


input CategoryInput {
  brand: String
  description: String
  features: [CategoryFeatureInput!]!
  offers:[CategoryOfferInput!]!
  hasWarrantyAndProduction: Boolean!
  image: Upload
  name: String!
  parent: String
}

type CategoryMini {
  image: String
  lvl: Int!
  cId: Int!
  name: String!
  parent: String!
  hasWarrantyAndProduction:Boolean!
  features: [CategoryFeature!]!
  offers:[CategoryOffer!]!
}

input CategoryUpdateInput {
  brand: String!
  description: String
  features: [CategoryFeatureInput!]!
  offers:[CategoryOfferInput!]!
  hasWarrantyAndProduction:Boolean!
  id: String!
  image: Upload
  name: String!
}

type CategoryFormData {
  brands: [Brand!]!
  offerTypes: [String!]!
  featureTypes: [String!]!
  offerAudiences:[String!]!
}



#Product
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
  rating: Int!
}

type ProductUpdateReturn {
  id:String!
  sku:String!
  features:[ProductFeature!]!
}

#type ProductFilterPage {
#  brand: String!
#  category: String
#  colours: [String!]!
#  description: String!
#  discount: Int!
#  filters: [CategoryFilterValue!]!
#  id: String!
#  images: [String!]!
 # name: String!
#  numRating: Int!
#  numReviews: Int!
#  price: Int!
#  rating: Int!
#}

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
  colours: [[String!]!]
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
  role: Int!
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
