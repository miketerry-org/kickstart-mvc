// controller.js: Support page controller functions

"use strict";

// controller function to return Support page
function getSupportPage(req, res) {
  res.render("features/support/index", { layout: false });
}

// export all controller functions
module.exports = { getSupportPage };
