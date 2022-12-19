export const CONST = {
  errors: {
    database: "An error occured in the data base",
    unknown: "An unknown error occured",
    login: "Please login",
    alreadyLoggedIn: "Already loggedin",
    signup: "Please sign up for an account",
    invalidLoginCredentials: "Invalid username or password",
    unAuthorized: "nnAuthorized",
    unAuthenticated: "unAuthenticated",
    userAlreadyExist: "User already exist",
    server: "An error occured on the server",
  },
  request: {
    methods: ["POST", "GET"],
    origins: [
      process.env.CLIENT_URL as string,
      "https://studio.apollographql.com",
    ],
  },
  messages: {
    user: {
      logged_in: "logged in",
      logged_out: "logged out",
      signup: "Account created",
    },
  },
};
