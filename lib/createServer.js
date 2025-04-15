// createServer.js:

"use strict";

// Load all necessary packages
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

// global server variable
let _server = undefined;

// Function to create the server
async function createServer(app) {
  // return global server variable
  if (_server) {
    return _server;
  }

  // If not in production mode, use local SSL certificates and create an HTTPS server
  if (!app.isProduction) {
    // initialize certificates object
    let certificates = {};
    certificates.key = fs.readFileSync(
      path.resolve("ssl-certs/web-starter.key")
    );
    certificates.cert = fs.readFileSync(
      path.resolve("ssl-certs/web-starter.crt")
    );

    // create the HTTPS server
    _server = https.createServer(certificates, app);

    // indicate we created an https server
    console.debug("HTTPS server created");
  } else {
    // When in production, create a plain HTTP server as the runtime environment handles SSL
    _server = http.createServer(app);

    // indicate we created a HTTP server
    console.debug("HTTP server created");
  }

  // return the global server object
  return _server;
}

// export all functions
module.exports = createServer;
