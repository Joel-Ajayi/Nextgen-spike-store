const typeDefs = `#graphql
type Query {
  GetBrand(name: String!): Brand
  GetBrands: [Brand!]!
  GetCategories(parent: String): [CategoryMini!]!
  GetCategory(name: String!): Category
  GetCreateProductData: CreateProductData
  #GetFilterPageProduct(category: String!, id: String!, reqImages: Boolean!): ProductMini
  GetProduct(id: String!): Product
  GetProductMini(category: String!, id: String!): ProductMini
  UserQuery: User
}

type Mutation {
  CreateBrand(data: BrandInput): Brand
  CreateCategory(data: CategoryInput): CategoryMini
  CreateProduct(data: ProductInput): Message
  ForgotPassword(email: String!): Message
  SignIn(data: SignInInput): Message
  SignOut: Message
  SignUp(data: SignUpInput): Message
  UpdateCategory(data: CategoryUpdateInput): CategoryMini
  UpdateCategoryParent(name: String!, parent: String!): CategoryMini
  UpdateProduct(data: UpdateProductInput): Message
  VerifyAccount(email: String!): Message
  VerifyPasswordToken(token: String!): Message
  VerifyToken(token: String!): Message
}

#General
type Message {
  message: String!
}

# scallar type
scalar Upload
scalar Date
scalar StringAndInt


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
  banners: [String!]!
  brand: String!
  description: String!
  features: [CategoryFeature!]!
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


input CategoryInput {
  brand: String
  description: String
  features: [CategoryFeatureInput!]!
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
}

input CategoryUpdateInput {
  brand: String!
  description: String
  features: [CategoryFeatureInput!]!
  hasWarrantyAndProduction:Boolean!
  id: String!
  image: Upload
  banners:[Upload]!
  name: String!
}



#Product
type Product {
  id: String!
  name: String!
  price: Int!
  brand: String!
  cId: Int!
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
  mfgDate: Date!
  warrCovered: String
  warrDuration: Int!
  features: [ProductFeatureInput!]!
}

input UpdateProductInput {
  id: String!
  name: String
  cId: String
  brand:String
  description: String
  price: Int
  discount: Int
  colors: [String!]
  count: Int
  paymentType: Int
  images: [Upload!]
  mfgDate: Date
  warrCovered: String
  warrDuration: Int
  features: [ProductFeatureInput!]
}

interface ProductFeature {
  id: String!
  optionId: String!
  value: String!
}

input ProductFeatureInput {
  id: String
  optionId: String!
  value: String!
}

type CreateProductData {
  brands: [Brand]!
  categories: [CategoryMini]!
  colours: [[String!]!]
  paymentTypes: [PaymentType!]!
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
