// setupHandlebars.js: module to setup handlebars template engine with express application

"use strict";

// load all necessary packages
const express = require("express");
const exphbs = require("express-handlebars");

// setup the application with the handlebars view engine
async function setup(app) {
  // Configure handlebars with custom directories
  const hbs = exphbs.create({
    defaultLayout: app.config.path_views_default_layout,
    layoutsDir: app.config.path_views_layout,
    partialsDir: app.config.path_views_partials,
    extname: "hbs",
  });

  // Set up the engine
  app.engine("hbs", hbs.engine);
  app.set("view engine", "hbs");
  app.set("views", app.config.path_views);

  // if in production mode then cashe all compiled templates
  if (app.isProduction) {
    app.enable("view cache");
  }
}

// export the function to setup handlebars view engine
module.exports = { setup };
