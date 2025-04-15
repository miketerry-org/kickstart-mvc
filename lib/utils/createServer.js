// createServer.js:

"use strict";

const { Certificate } = require("crypto");
// Load all necessary packages
const fs = require("fs");
const http = require("http");
const https = require("https");

// global server object
const _server = undefined;

// Function to create the server
async function createServer(app) {
  // return global server variable if already initialized
  if (_server) {
    return _server;
  }

  // If not in production mode, use local SSL certificates and create an HTTPS server
  if (!app.isProduction) {
    const certificates = {};
    certificates.key = fs.readFileSync("../ssl-certs/web-starter.key");
    certificates.cert = fs.readFileSync("../ssl-certs/web-starter.crt");

    _server = https.createServer(Certificates, app);
  } else {
    // When in production, create a plain HTTP server as the runtime environment handles SSL
    _server = http.createServer(app);
  }

  // return the server object
  return _server;
}

// export all functions
module.exports = createServer;
