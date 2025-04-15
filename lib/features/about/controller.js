// controller.js: about page controller functions

"use strict";

// controller function to return About page
function getAboutPage(req, res) {
  res.render("features/about/index", { layout: false });
}

// export all controller functions
module.exports = { getAboutPage };
