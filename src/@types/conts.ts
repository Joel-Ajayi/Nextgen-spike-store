export const CONST = {
  errors: {
    database: "An error occured in the data base",
    unknown: "An unknown error occured",
    login: "Please login",
    alreadyLoggedIn: "Already loggedin",
    signup: "Please sign up for an account",
    invalidLoginCredentials: "Invalid username or password",
    unAuthorized: "unAuthorized",
    unAuthenticated: "unAuthenticated",
    userAlreadyExist: "User already exist",
    server: "An error occured on the server",
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
    origins: ["https://studio.apollographql.com"],
  },
  messages: {
    user: {
      logged_in: "logged in",
      logged_out: "logged out",
      signup: "Account created",
    },
  },
};
