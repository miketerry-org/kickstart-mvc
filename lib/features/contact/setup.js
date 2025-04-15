// setup.js: contact page setup function

"use strict";

// load all necessary packages
const { getContactPage } = require("./controller");

// implement setup function to initialize contact page with express application
async function setup(app) {
  app.get("/contact", getContactPage);
}

// export the setup function
module.exports = { setup };
