const typeDefs = `#graphql
type Query {
  GetBrand(name: String!): Brand
  GetBrands: [Brand!]!
  GetCategories: [CategoryMini!]!
  GetCategory(name: String!): Category
  GetColors: [[String]]!
  GetCreateProductData: CreateProductData
  GetFilterPageProduct(category: String!, id: String!, reqImages: Boolean!): ProductMini
  GetProduct(category: String!, id: String!): Product
  GetProductMini(category: String!, id: String!): ProductFilterPage
  UserQuery: User
}

type Mutation {
  CreateBrand(data: BrandInput): Brand
  CreateCategory(data: CategoryInput): CategoryMini
  CreateProduct(data: ProductInput): ProductMini
  ForgotPassword(email: String!): Message
  SignIn(data: SignInInput): Message
  SignOut: Message
  SignUp(data: SignUpInput): Message
  UpdateCategory(data: CategoryUpdateInput): CategoryMini
  UpdateCategoryParent(name: String!, parent: String!): CategoryMini
  UpdateProductCategory(data: UpdateProductCategoryInput): Message
  UpdateProductInfo(data: UpdateProductInfoInput): Message
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
  filters: [CategoryFilter!]!
  hasMfg: Boolean!
  hasWarranty: Boolean!
  id: String!
  image: [String!]!
  lvl: Int!
  name: String!
  parent: String
}

type CategoryFilter {
  id: String!
  isRequired: Boolean!
  name: String!
  options: [String!]!
  type: String
  unit: String
}

input CategoryFilterInput {
  id: String
  isRequired: Boolean!
  name: String!
  options: [String!]!
  type: CatFilterType!
  unit: String
}

input CategoryFilterUpdateInput {
  id: String!
  isRequired: Boolean!
  name: String!
  options: [String!]!
  type: CatFilterType!
  unit: String
}


input CategoryInput {
  brand: String
  description: String
  filters: [CategoryFilterInput!]!
  hasMfg: Boolean!
  hasWarranty: Boolean!
  image: Upload
  name: String!
  parent: String
}

type CategoryMini {
  image: String
  lvl: Int!
  name: String!
  parent: String!
}

enum CatFilterType {
  Number
  Text
}

input CategoryUpdateInput {
  brand: String!
  description: String
  filters: [CategoryFilterInput!]!
  hasMfg: Boolean!
  hasWarranty: Boolean!
  id: String!
  image: Upload!
  name: String!
}

type CreateProductData {
  brands: [Brand]!
  categories: [CategoryMini]!
  colours: [[String!]!]
  paymentMethods: [String]!
}



#Product
type Product {
  brand: String!
  category: String
  colors: [String!]!
  description: String!
  discount: Int!
  filters: [CategoryFilterValue!]!
  id: String!
  images: [String!]!
  mfgCountry: String
  mfgDate: String
  name: String!
  payment: [Int!]!
  price: Int!
  warrCovered: String
  warrDuration: Int
}

type ProductFilterPage {
  brand: String!
  category: String
  colors: [String!]!
  description: String!
  discount: Int!
  filters: [CategoryFilterValue!]!
  id: String!
  images: [String!]!
  name: String!
  numRating: Int!
  numReviews: Int!
  price: Int!
  rating: Int!
}

input ProductInput {
  brand: String!
  cId: Int!
  colors: [String!]!
  count: Int!
  description: String!
  discount: Int
  filters: [CategoryFilterValueInput!]!
  images: [Upload!]!
  mfgCountry: String!
  mfgDate: String!
  name: String!
  payment: [String!]!
  price: Int!
  warranty: ProductWarrantyInput
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

input ProductWarrantyInput {
  covered: String!
  duration: Int!
}

type CategoryFilterValue {
  id: String!
  name: String!
  optionId: String!
  type: String
  unit: String
  values: [String!]!
}

input CategoryFilterValueInput {
  id: String
  optionId: String!
  values: [String!]!
}

input CategoryFilterValueUpdateInput {
  id: String!
  optionId: String!
  values: [String!]!
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

input UpdateProductCategoryInput {
  cId: String!
  filters: [CategoryFilterValueInput!]!
  pId: String!
}

input UpdateProductInfoInput {
  brand: String!
  colors: [String!]!
  count: Int!
  description: String!
  discount: Int
  id: String!
  images: [Upload!]!
  mfgCountry: String!
  mfgDate: String!
  name: String!
  payment: [String!]!
  price: Int!
  warranty: ProductWarrantyInput
}
`;

export default typeDefs;
