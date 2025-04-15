// createLogger.js:
//
// "use strict";

// Load necessary packages
const Confirm = require("confirm-json");
const confirm = require("confirm-json");
const winston = require("winston");
require("winston-mongodb"); // This is necessary to use the MongoDB transport

// global server logger object
let _logger = undefined;

// Function to create the logger instance
async function createLogger(config, recreateCollection = false) {
  // return global variable if logger already created
  if (_logger) {
    return _logger;
  }

  // Validate the configuration properties
  const errors = new Confirm(config)
    .isString("databaseURL", undefined, 1, 255)
    .isString("collectionName", "logs", 1, 255)
    .isInteger("expirationDays", undefined, 1, 365, false)
    .isBoolean("capped", undefined, false)
    .isInteger("maxSize", undefined, 1, 1000, false) // Max size for capped collections
    .isInteger("maxDocs", undefined, 1000, 1000000, false); // Max docs for capped collections

  // If any errors then throw exception
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  // Destructure the tenant log config object with default values for optional properties
  const {
    db_url,
    collectionName,
    expirationDays = undefined,
    capped = false,
    maxSize = undefined,
    maxDocs = undefined,
  } = config;

  // Create MongoDB client
  const MongoClient = require("mongodb").MongoClient;
  const client = await MongoClient.connect(db_url);
  const db = client.db();

  const collectionObj = db.collection(collectionName);

  // Optionally force recreation of the collection
  if (recreateCollection) {
    // Drop the collection if it exists (ignore error if it doesn't exist)
    try {
      await collectionObj.drop();
    } catch (err) {
      if (err.codeName !== "NamespaceNotFound") {
        throw new Error("Error dropping collection:", err);
      }
    }
  }

  // Check for conflicting options: cannot use both capped and TTL options
  if (capped && expirationDays) {
    throw new Error(
      "Cannot use both capped and TTL options for the same collection."
    );
  }

  // If capped collection properties are specified
  if (capped && maxSize && maxDocs) {
    // Create a capped collection if the properties are provided
    await db.createCollection(collectionName, {
      capped: true,
      size: maxSize * 1024 * 1024, // Max size converted from MB to bytes
      max: maxDocs, // Limit to a maximum number of documents
    });
  }
  // If no capped collection config, check for TTL index
  else if (expirationDays) {
    // Create a TTL index on the specified field (default is 'timestamp')
    await collectionObj.createIndex(
      { timestamp: 1 }, // Create index on 'timestamp' field
      { expireAfterSeconds: expirationDays * 24 * 60 * 60 } // Expire documents after specified days
    );
  }
  // If neither capped nor TTL config is provided, just create a standard collection
  else {
    await db.createCollection(collectionName);
  }

  // Create the logger instance
  _logger = winston.createLogger({
    level: "info", // Set default logging level
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      // Console transport for logging to the console
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      // MongoDB transport to log to MongoDB
      new winston.transports.MongoDB({
        db: db_url,
        collection: collectionName,
        level: "info", // Minimum level to log into MongoDB (can be adjusted)
        options: {},
      }),
    ],
  });

  // if in development mode then log successful creation of winston logger
  console.debug("Winston server log created");

  // return the global winston logger
  return _logger;
}

// Export the create logger function
module.exports = createLogger;
