const consts = {
  errors: {
    database: "An error occured in the data base",
    signIn: "Please login",
    alreadySignedIn: "Already loggedin",
    signup: "Please sign up for an account",
    invalidSignIn: "Invalid username or password",
    unAuthorized: "You are not Authorized to View this Page",
    unAuthenticated: "unAuthenticated",
    userAlreadyExist: "User already exist",
    server: "An error occured",
    invalidToken: "Invalid token",
    files: {
      inCorrectImageFormat: "Image file format not supported",
      inCorrectVideoFormat: "Video file format not supported",
      exceededMaxNumber: `Number of files should not exceed`,
      exceededMaxSize: `File size should not exceed`,
      duplicate: "Duplicate files detected",
      alreadyExist: "File already exist",
      leastFileUpload: "Number of files should be at least",
    },
    product: {
      prdNotFound: "Product not found",
    },
    categories: {
      catNotFound: "Category not found",
    },
  },
  users: {
    maxAddresses: 3,
    states: [
      {
        name: "Ondo",
        cities: [
          {
            name: "Akure",
            localities: ["Alagbaka", "Oba-ILe", "Ijapo Estate", "Isikan"],
          },
        ],
      },
    ],
  },
  product: {
    shippingAmount: 1000,
    sku: {
      price: 50,
    },
    payment: {
      init: "https://api.paystack.co/transaction/initialize",
      validate: "https://api.paystack.co/transaction/verify",
      channels: ["card"],
      callback: "https://nextgen-store-5f0bea566c44.herokuapp.com/",
    },
  },
  files: {
    mimeType: {
      supportedImg: [
        "image/svg+xml",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/jpeg",
        "image/tiff",
      ],
      supportedVd: ["video/mp4", "video/mkv"],
    },
    vdSize: 5 * 1024 * 1024, //5mb
    imgSize: 190 * 1024, //190kb
    product: {
      min: 1,
      max: 3,
    },
  },
  request: {
    paginationTake: 30,
    methods: ["POST", "GET"],
    origins: ["http://localhost:3000", "https://studio.apollographql.com"],
  },
  messages: {
    signedIn: "Signed in",
    signedOut: "Signed out",
    signedUp: "Account created",
    emailVerification:
      "If email exist, an email has been sent to validate account",
    emailVerified: "Email has been verified",
    forgotPwdEmail: "If email exist, an email has been sent to reset password",
    passwordChange: "Password has been Changed. Please SignIn",
  },
};

export default consts;
