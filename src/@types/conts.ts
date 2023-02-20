export const CONST = {
  errors: {
    database: "An error occured in the data base",
    unknown: "An unknown error occured",
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
      leastFileUpload: "Number of files should be at least",
    },
  },
  files: {
    mimeType: {
      images: ["jpg", "png", "gif", "jpeg", "tiff"],
      videos: ["mp4", "mkv"],
    },
    maxVideoSize: 5000000,
    maxImageSize: 100000,
  },
  request: {
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
