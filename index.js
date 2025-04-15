// index.js:

"use strict";

// load all necessary modules
const createConfig = require("./lib/createConfig");
const createLogger = require("./lib/createLogger");
const createApp = require("./lib/createApp");
const createServer = require("./lib/createServer");

module.exports = { createApp, createConfig, createLogger, createServer };
