const consts = {
  errors: {
    database: "An error occured in the data base",
    signIn: "Please login",
    alreadySignedIn: "Already loggedin",
    signup: "Please sign up for an account",
    invalidSignIn: "Invalid username or password",
    unAuthorized: "unAuthorized",
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
  sku: {
    price: 50,
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
    origins: ["https://localhost:3000", "https://studio.apollographql.com"],
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
