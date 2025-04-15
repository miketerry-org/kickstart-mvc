// controller.js: contact page controller functions

"use strict";

// controller function to return contact page
function getContactPage(req, res) {
  res.render("features/contact/index", { layout: false });
}

// export all controller functions
module.exports = { getContactPage };
