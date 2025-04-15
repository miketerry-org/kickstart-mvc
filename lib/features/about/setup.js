// setup.js: about page setup function

// load all necessary packages
const { getAboutPage } = require("./controller");

// implement setup function to initialize about page with express application
async function setup(app) {
  app.get("/about", getAboutPage);
}

// export the setup function
module.exports = { setup };
