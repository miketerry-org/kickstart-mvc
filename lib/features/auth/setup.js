// setup.js: auth routes setup function

// load all necessary packages
const {
  getEnterEmailForm,
  postEnterEmailForm,
  postEnterCodeForm,
} = require("./controller");

// implement setup function to initialize authentication pages with express application
async function setup(app) {
  // define route handlers using controller functions
  app.get("/sign-in", getEnterEmailForm);
  app.post("/sign-in", postEnterEmailForm);
  app.post("/verify-code", postEnterCodeForm);
}

// export the setup function
module.exports = { setup };
