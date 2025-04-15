// controller.js:

"use strict";

// load all necessary packages
const processEnterEmailForm = require("./services/processEnterEmailForm");
const processEnterCodeForm = require("./services/processEnterCodeForm");

// controller function to return enter email form
function getEnterEmailForm(req, res) {
  console.log("here1");
  res.render("features/auth/form-enter-email");
}

// controller function to process the enter email form
async function postEnterEmailForm(req, res) {
  // call service method to process the email for step 1 of authentication
  let { data, template } = await processEnterEmailForm(
    req.db,
    req.body,
    res.locals
  ); // Await the result

  // render data with the appropriate template
  res.render(template, data);
}

async function postEnterCodeForm(req, res) {
  // call service method to process the email for step 2 of authentication
  let { data, template } = await processEnterCodeForm(
    req.db,
    req.body,
    res.locals
  );

  // render data with the appropriate template
  res.render(template, data);
}

module.exports = { getEnterEmailForm, postEnterEmailForm, postEnterCodeForm };
