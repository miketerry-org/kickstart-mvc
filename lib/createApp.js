// createApp.js:

"use strict";

// load all necessary modules
const express = require("./express-enhanced");

// global application variable
let _app = undefined;

async function createApp(config, logger) {
  // return global application variable if already created
  if (_app) {
    return _app;
  }

  // initialize the enhanced express application
  _app = express(config, logger);

  // add middleware to immediately log request info when in development mode
  _app.use((req, res, next) => {
    console.debug("req", req.url);
    next();
  });

  // run all express setup functions
  await _app.runExpressSetup("setupTenants");
  await _app.runExpressSetup("setupExpress");
  await _app.runExpressSetup("setupHandlebars");

  // run all feature setup functions
  await _app.runFeatureSetup("auth");
  await _app.runFeatureSetup("home");
  await _app.runFeatureSetup("about");
  await _app.runFeatureSetup("contact");
  await _app.runFeatureSetup("support");

  // if in development mode the indicate application fully initialized
  console.debug("express application fully initialized");

  // return  the fully initialized express application
  return _app;
}

// export function tocreate fully initialized express application
module.exports = createApp;
