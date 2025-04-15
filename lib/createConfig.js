// createConfig.js:

"use strict";

// load all necessary modules
const path = require("path");
const Confirm = require("confirm-json");
const TopSecret = require("topsecret");

// global configuration object
let _config = undefined;

// function to perform all config setup
async function createConfig() {
  // if this function has allready been called then just return
  if (_config) {
    return _config;
  }

  // if not running in production mode then load encryption key from .env file
  if (!process.env.NODE_ENV || process.env.NODE_ENV.toLowerCase() !== "prod") {
    require("dotenv").config({ path: "./assets/.env" });
  }

  // throw exception if the encryption key is not an environment variable
  if (!process.env.ENCRYPT_KEY || process.env.ENCRYPT_KEY.length !== 64) {
    throw new Error(
      `The "ENCRYPT_KEY" environment variable must be a string of length 64 characters`
    );
  }

  // initialize the encryption/decryption class
  let topsecret = new TopSecret();

  // get decryption key from environment variables
  topsecret.key = process.env.ENCRYPT_KEY;

  // get full path to secure server configuration file
  const filename = path.resolve("./assets/config-server.secure");
  console.debug("Server Config File", filename);

  // load and decrypt the secure server configuration values into global object
  _config = topsecret.decryptJSONFromFile(filename);

  // instanciate a JSON confirmation instance
  let confirm = new Confirm(_config);

  // verify all server configuration values
  confirm
    .isInteger("port", undefined, 1, 60000)
    .isString("db_url", undefined, 1, 255)
    .isString("log_collection_name", "logs", 1, 255)
    .isInteger("log_expiration_days", 1, 1, 365)
    .isBoolean("log_capped", undefined)
    .isInteger("log_max_size", 10, 10, 1000)
    .isInteger("log_max_docs", 10000, 1000, 1000000)
    .isString("session_collection_name", "sessions", 1, 255)
    .isString("session_secret", undefined, 1, 255)
    .isInteger("session_timeout", 30, 10, 3600)
    .isInteger("rate_limit_minutes", 10, 1, 60)
    .isInteger("rate_limit_requests", 200, 10, 10000)
    .isString("path_static", "public", 1, 255)
    .isString("path_views", "views", 1, 255)
    .isString("path_views_layouts", "views/layouts", 1, 255)
    .isString("path_views_partials", "views/partials", 1, 255)
    .isString("path_views_default_layout", "layout", 1, 255);

  // if any errors then throw exception
  if (confirm.errors.length > 0) {
    throw new Error(confirm.errors.join("\n"));
  }

  // when in development mode, display the validated server configuration
  console.debug("_config", _config);

  // return the global configuration object
  return _config;
}

// return the create configuration function
module.exports = createConfig;
