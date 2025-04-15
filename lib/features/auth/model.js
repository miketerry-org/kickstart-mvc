// model.js:

"use strict";

// load all necessary packages
const mongoose = require("mongoose");

// Default configuration for login attempts and lock duration
const defaultConfig = {
  maxAttempts: 5, // Max login attempts allowed in the attempt window
  attemptWindow: 15 * 60 * 1000, // 15 minutes in milliseconds
  lockDuration: 30 * 60 * 1000, // 30 minutes lock duration in milliseconds
};

// Define the schema for the "Auth" collection
const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Convert email to lowercase to avoid duplicates with different cases
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Please fill a valid email address",
      ],
    },
    verificationCode: {
      type: String,
      required: true,
    },
    verificationCodeExpiration: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Login attempt tracking fields
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Static method to find a user by email and check if the verification code is valid
authSchema.statics.verifyCode = async function (email, code) {
  const user = await this.findOne({ email });

  // throw error if email not found
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email already verified");
  }

  if (user.verificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  const now = new Date();
  if (user.verificationCodeExpiration < now) {
    throw new Error("Verification code has expired");
  }

  user.isVerified = true;
  await user.save();
  return user;
};

// Method to create a new verification code in the "xxx-xxx" format
authSchema.methods.createVerificationCode = function () {
  // Generate two random 3-digit numbers and combine them with a hyphen
  const firstPart = Math.floor(100 + Math.random() * 900); // Generates a 3-digit number
  const secondPart = Math.floor(100 + Math.random() * 900); // Generates another 3-digit number

  const code = `${firstPart}-${secondPart}`; // Combine both parts with a hyphen

  // Set verification code and expiration (e.g., expire after 10 minutes)
  this.verificationCode = code;
  this.verificationCodeExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

  return code;
};

// Method to track login attempts and apply lock if necessary
authSchema.methods.incrementLoginAttempts = async function () {
  const now = Date.now();
  const config = {
    maxAttempts: this.maxAttempts || defaultConfig.maxAttempts,
    attemptWindow: this.attemptWindow || defaultConfig.attemptWindow,
    lockDuration: this.lockDuration || defaultConfig.lockDuration,
  };

  // If the user is currently locked, check if the lock duration has expired
  if (this.lockUntil && this.lockUntil > now) {
    throw new Error("Account is temporarily locked. Please try again later.");
  }

  // Reset the loginAttempts counter if the last attempt was outside the attempt window
  if (this.lastAttemptAt && this.lastAttemptAt + config.attemptWindow < now) {
    this.loginAttempts = 0;
  }

  // Increment the login attempts count and set the last attempt timestamp
  this.loginAttempts += 1;
  this.lastAttemptAt = now;

  // If the number of attempts exceeds the max allowed, lock the account
  if (this.loginAttempts >= config.maxAttempts) {
    this.lockUntil = new Date(now + config.lockDuration); // Set lock duration
    this.loginAttempts = 0; // Reset attempts after lock
  }

  await this.save();
};

// Export a function to create a model based on the tenant's Mongoose connection
function AuthModel(mongooseConnection) {
  // Check if the model is already registered on this connection
  if (mongooseConnection.models.Auth) {
    return mongooseConnection.models.Auth;
  }
  return mongooseConnection.model("Auth", authSchema);
}

// Export the function
module.exports = AuthModel;
