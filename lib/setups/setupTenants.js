// setupTenants.js:

"use strict";

// Load all necessary modules
const {
  Tenant,
  Tenants,
  createMongoDBConnection,
  createNodeMailer,
  createWinstonMongoDBLog,
} = require("express-tenants");
// Define custom tenant class
class WebStarterTenant extends Tenant {
  async defineServices() {
    await this.addService("db", createMongoDBConnection);
    await this.addService("log", createWinstonMongoDBLog);
    await this.addService("mailer", createNodeMailer);
  }
}

// Global tenants list (module-scoped singleton)
let _tenants = undefined;

// Middleware to resolve tenant by hostname and attach services
function TenantMiddleware(req, res, next) {
  try {
    if (!_tenants) {
      console.debug("Tenant system not initialized");
      return res.status(500).send("Tenant system not initialized");
    }

    // Use the request hostname to find the correct tenant
    const tenant = _tenants.find(req.hostname);

    // Return 404 error if tenant is not found
    if (!tenant) {
      console.debug("Tenant not found", req.hostname);
      return res.status(404).send("Tenant not found");
    }

    // Assign tenant and database instances to request
    req.tenant = tenant;
    req.db = tenant.services.db;

    // Combine tenant site properties with response locals
    res.locals = { ...res.locals, ...tenant.site };

    // tenant found so display locals which will be passed to view renderer
    console.debug(`tenant: ${req.hostname}`, res.locals);

    // Proceed to the next middleware
    next();
  } catch (err) {
    console.debug(`Database connection failed: ${err.message}`);
    const log = req.tenant?.services.log || console;
    log.error(`Database connection failed: ${err.message}`);
    res.status(500).send("Internal Server Error");
  }
}

// Function to initialize all tenants and attach middleware
async function setup(app) {
  try {
    // Exit early if tenants already set up
    if (_tenants) {
      return;
    }

    // Load environment variables in non-production environments
    if (!app.isProduction) {
      require("dotenv").config();
    }

    // Initialize tenants manager
    _tenants = Tenants(WebStarterTenant);

    // Validate and assign encryption key
    if (process.env.ENCRYPT_KEY && process.env.ENCRYPT_KEY.length === 64) {
      _tenants.key = process.env.ENCRYPT_KEY;
      console.debug(`_tenants.key: ${_tenants.key}`);
    } else {
      console.debug(
        `The "ENCRYPT_KEY" environment variable is missing or incorrect length`
      );
      throw new Error(
        `The "ENCRYPT_KEY" environment variable must be defined and have a length of 64 characters`
      );
    }

    // Load tenant configuration from secure file
    await _tenants.loadFromFile("config-tenants.secure");

    // Attach middleware to resolve tenant per request
    app.use(TenantMiddleware);

    // indicate the number of tenants properly initialized
    console.debug(`${_tenants.length} tenants were initialized`);
  } catch (err) {
    console.debug("Tenant initialization failed", err.message);
    throw new Error(`Tenant setup failed: ${err.stack || err.message}`);
  }
}

// Export setup function and optional diagnostics hook
module.exports = {
  setup,
  getTenants: () => _tenants,
};
