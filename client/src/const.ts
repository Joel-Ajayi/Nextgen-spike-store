export const CONSTS = {
  errors: {
    code: {
      network: "ERR_NETWORK",
      badResponse: "ERR_BAD_RESPONSE",
    },
    errorOccured: "Sorry, an Error occured",
    database: "An error occured in the data base",
    unknown: "An unknown error occured",
    signIn: "Please login",
    alreadySignedIn: "Already loggedin",
    signup: "Please sign up for an account",
    invalidSignIn: "Invalid username or password",
    unAuthorized: "unAuthorized",
    unAuthenticated: "unAuthenticated",
    userAlreadyExist: "User already exist",
    badResponse: "Network Error",
    invalidToken: "Invalid token",
    files: {
      inCorrectImageFormat: "Image file format not supported",
      duplicate: "Duplicate files detected",
      inCorrectVideoFormat: "Video file format not supported",
      exceededMaxNumber: `Number of files should not exceed`,
      exceededMaxSize: `File size should not exceed`,
      leastFileUpload: "Number of files should be at least",
    },
  },
  files: {
    mimeType: {
      supportedImg: ".jpg,.jpeg,.bmp,.tif,.tiff,.gif,.png",
      supportedVd: ".mp4,.mkv",
    },
    vdSize: 5 * 1024 * 1024,
    imgSize: 100 * 1024,
  },
  ids: {
    appSideBar: "APP_SIDE_BAR1",
  },
};
