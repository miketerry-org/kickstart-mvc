// express-enhanced.js

"use strict";

// load all necessary modules
const path = require("path");
const express = require("express");

// function to create enhanced express object
function enhancedExpress(config, logger) {
  // ensure the configuration object is passed
  if (!config || typeof config !== "object") {
    throw new Error(`createApp: "Config" object is required`);
  }

  // ensure the logger object is passed
  if (!logger || typeof logger !== "object") {
    throw new Error(`createApp: "logger" object is required`);
  }

  // initialize standard express object
  let app = express();

  // assign private properties to application instance
  app._config = config;
  app._logger = logger;

  // add the "config" property to the express application
  Object.defineProperty(app, "config", {
    get() {
      return app._config;
    },
  });

  // add the "logger" property to the express application
  Object.defineProperty(app, "logger", {
    get() {
      return app._logger;
    },
  });

  // assign fatalError method to express application object
  app.fatalError = (err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
  };

  // assign method to load express setup functions and call them
  app.runExpressSetup = async (moduleName) => {
    try {
      // get the fully qualified filename where the module is always in the lib/setups folder
      const filename = path.resolve(path.join("./lib/setups", moduleName));

      // load the specified module as we were in the main application
      let module = require.main.require(filename);

      // determine if module has setup function
      let hasSetup =
        module &&
        typeof module === "object" &&
        typeof module.setup === "function";

      // if there is a setup method then call it
      if (hasSetup) {
        await module.setup(app);
      } else {
        throw new Error(
          `Module ${moduleName} ddid not return an object with a "setup" function`
        );
      }
    } catch (err) {
      console.log("err", err);
      app.fatalError(err.message);
    }
  };

  // assign method to load feature setup functions and call them
  app.runFeatureSetup = async (moduleName) => {
    try {
      // get the fully qualified filename where the module is always in the lib/features folder
      const filename = path.resolve(
        path.join("./lib/features", moduleName, "setup.js")
      );

      // load the specified module as we were in the main application
      let module = require.main.require(filename);

      // determine if module has setup function
      let hasSetup =
        module &&
        typeof module === "object" &&
        typeof module.setup === "function";

      // if there is a setup method then call it
      if (hasSetup) {
        await module.setup(app);
      } else {
        throw new Error(
          `Module ${moduleName} ddid not return an object with a "setup" function`
        );
      }
    } catch (err) {
      console.log("err", err);
      app.fatalError(err.message);
    }
  };

  // assign function to compare node environment
  app.isNodeEnv = (mode) => {
    let value = process.env.NODE_ENV;
    return value && value.toUpperCase() === mode.toUpperCase();
  };

  // define the "isProduction" property
  Object.defineProperty(app, "isProduction", {
    get() {
      return app.isNodeEnv("prod");
    },
  });

  // define the "isDevelopment" property
  Object.defineProperty(app, "isDevelopment", {
    get() {
      return app.isNodeEnv("dev");
    },
  });

  // define the "isTesting" property
  Object.defineProperty(app, "isTesting", {
    get() {
      return app.isNodeEnv("test");
    },
  });

  // return the enhanced express object
  return app;
}

// return function to create enhanced express application
module.exports = enhancedExpress;
