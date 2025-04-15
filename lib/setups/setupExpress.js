// setupExpress.js:

"use strict";

// load all module dependencies
const path = require("path");
const fs = require("fs");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const MongoDBStore = require("connect-mongodb-session")(session);

// perform configuration for the express application
async function setup(app) {
  // compress all responses
  app.use(compression());

  // assign Body parser for both JSON and urlencoded form data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // assign Cookie parser
  app.use(cookieParser());

  // initialize MongoDB session store
  const store = new MongoDBStore({
    uri: app.config.db_url,
    collection: app.config.session_collectionName,
  });

  // define error handler for session load/save errors
  store.on("error", function (error) {
    console.error("MongoDB Session Error: ", error);
  });

  // initialize and assign session store with MongoDB
  app.use(
    session({
      secret: app.config.session_secret,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        secure: app.isProduction, // use secure cookies in production
        httpOnly: true, // prevent JS from accessing cookies
        maxAge: app.session_timeout * 60000, // convert minutes to milliseconds
        sameSite: "Lax", // prevent CSRF attacks
      },
    })
  );

  // add Development logging middleware
  if (app.isDevelopment) {
    app.use(morgan("dev"));
  }

  // assign File uploading
  app.use(fileupload());

  // assign security headers
  app.use(helmet()); // Add security headers (e.g., CSP, XSS protection)

  // Prevent XSS attacks
  app.use(xss());

  // assign Rate limiting
  app.use(
    rateLimit({
      windowMs: app.config.rate_limit_minutes * 60000,
      max: app.config.rate_limit_requests,
    })
  );

  // Prevent HTTP param pollution
  app.use(hpp());

  // Enable CORS
  app.use(cors());

  // Serve static assets from the "public" directory
  app.use(
    express.static(app.config.path_static, {
      maxAge: "1y", // Cache static assets for 1 year
      etag: true, // Enable ETag for conditional requests
    })
  );

  // middleware to set layout based on HTMX request
  app.use((req, res, next) => {
    res.locals.layout = req.get("HX-Request")
      ? false
      : app.config.path_views_default_layout;
    next();
  });
}

// export the setup function as property of object
module.exports = { setup };
