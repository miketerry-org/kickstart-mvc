"use strict";

// load all required modules
const Confirm = require("confirm-json");
const AuthModel = require("../model");

/**
 * Verifies the format of the verification code in the request body.
 *
 * @param {Object} body - The request body containing the form data.
 * @param {Object} locals - The locals object for the current request.
 * @returns {Object} - An object containing the merged locals, body, and errors.
 */
function verifyCodeForm(body, locals) {
  console.debug("verifyCodeForm", body);
  // Regular expression for 3 digits + hyphen + 3 digits
  const pattern = /^[0-9]{3}-[0-9]{3}$/;
  console.debug("before", body["code"]);

  // Verify the code is in the body and is valid
  let errors = new Confirm(body).isRegEx("code", undefined, pattern).errors;
  console.debug("after");
  console.debug("errors", errors);

  // Return the merged locals, body and errors
  let temp = { ...locals, ...body, errors };
  console.debug("temp", temp);
  return temp;
}

/**
 * Processes the form where the user enters the verification code.
 * Validates the code and handles the authentication process.
 *
 * @param {Object} db - The database connection object.
 * @param {Object} body - The request body containing the form data.
 * @param {Object} locals - The locals object for the current request.
 * @returns {Promise<Object>} - An object containing the data, errors, and template to render.
 */
async function processEnterCodeForm(db, body, locals) {
  console.debug("here1");
  // initialize local variables
  let auth = null;
  let data = null;
  let template = null;

  try {
    console.debug("here2");
    // Step 1: Validate the code format using the helper function
    data = verifyCodeForm(body, locals);
    console.debug("here3", data);

    // re-render entry code form if one or more errors found in body
    if (data.errors.length > 0) {
      template = "features/auth/form-enter-code";
      return { data, template };
    }

    // Step 2: Initialize the Auth model for the tenant database
    const Auth = AuthModel(db);

    // Step 3: Retrieve the auth record based on the email passed
    auth = await Auth.findOne({ email: data.email });

    // Handle the case where the auth record doesn't exist
    if (!auth) {
      data.errors.push("No authentication record found for this email.");
      template = "features/auth/form-enter-email";
      return { data, template };
    }

    // Step 4: Increment login attempts and check if the account is locked
    await auth.incrementLoginAttempts();

    // Step 5: Try to verify the code using the AuthModel's verifyCode method
    await Auth.verifyCode(data.email, data.code);

    // If no errors, render dashboard
    template = "features/dashboard/index";
  } catch (err) {
    console.log("err", err);
    console.log("data-a", data);
    if (err.message === "User not found") {
      data.errors.push(
        "No authentication record found for this email.  Please re-enter the email"
      );
      template = "features/auth/form-enter-email";
    } else if (err.message === "Invalid verification code") {
      data.errors.push("The verification code you entered is incorrect.");
      template = "features/auth/form-enter-code";
    } else if (err.message === "Verification code has expired") {
      data.errors.push(
        "The verification code has expired. Please request a new code by signing in again."
      );
      template = "features/auth/form-enter-email";
    } else if (err.message === "Email already verified") {
      data.errors.push("This email is already verified.");
      template = "features/dashboard/index";
    } else if (
      err.message === "Account is temporarily locked. Please try again later."
    ) {
      data.errors.push(
        "Your account is temporarily locked due to multiple failed login attempts."
      );
      template = "features/auth/account-temporarily-locked";
    } else {
      // Catch any other unexpected errors and set template to unknown error
      data.errors.push(err.message);
      template = "unexpected-error";
    }
  }

  // Return data, errors and template
  return { data, template };
}

// export the processEnterCodeForm function
module.exports = processEnterCodeForm;
