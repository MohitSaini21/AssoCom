// Importing Required Modules
import express from "express"; // Core framework for building the server
import { config } from "dotenv"; // For environment variable management
import { authControl } from "./routers/authControlRouter.js"; // Importing the authentication router
import ejs from "ejs"; // Template engine for rendering views
import cron from "node-cron";
import passport from "passport";
import cookieParser from "cookie-parser";

import { ConnectDB } from "./config/db.js";

import { checkAuth } from "./middlwares/checkAuthDash.js";
import { checkAuthHome } from "./middlwares/checkHome.js";
import User from "./models/userSchema.js";
import { clientRoute } from "./routers/client.js";
// import { workerRoute } from "./routers/worker.js";
import { workerRoute } from "./routers/worker.js";

// Load Environment Variables
config();

// Schedule the task to run every day at midnight
// Function to clean up unverified users
const cleanupUnverifiedUsers = async () => {
  try {
    const now = new Date();

    // Find unverified users who signed up more than 3 days ago
    const usersToDelete = await User.find({
      isEmailVerified: false,
      createdAt: { $lt: new Date(now - 3 * 24 * 60 * 60 * 1000) }, // 3 days in milliseconds
      // createdAt: { $lt: new Date(now -  5 * 60 * 1000) }, // 3 days in milliseconds
    });

    if (usersToDelete.length > 0) {
      console.log(`Found ${usersToDelete.length} unverified users to delete`);

      // Delete users if they are not verified and if their createdAt time exceeds 3 days
      for (const user of usersToDelete) {
        // Double-check if the user is still unverified before deletion (avoiding race condition)
        const userInDb = await User.findById(user._id); // Fetch the user again

        if (!userInDb.isEmailVerified) {
          // Proceed with deletion if the user hasn't verified the email
          await User.deleteOne({ _id: userInDb._id });
          console.log(`User with email ${userInDb.email} deleted successfully`);
        }
      }
    } else {
      console.log("No unverified users to delete");
    }
  } catch (err) {
    console.error("Error during cleanup of unverified users:", err);
  }
};

// Automatically run cleanup every day at midnight
cron.schedule("0 0 * * *", cleanupUnverifiedUsers);

// Manually trigger cleanup (this is what you can use to run it immediately)
// cleanupUnverifiedUsers();
// Define Constants
const PORT = process.env.PORT || 8000; // Default to 8000 if PORT is not defined in .env

// Initialize Express App
const app = express();

// Initialize Passport
app.use(passport.initialize());
app.use(cookieParser());

// Middleware and Settings
// Set EJS as the view engine (Corrected 'view engine' typo)
app.set("view engine", "ejs");

// Middlewares for Parsing and Static Files (Optional, Add if Needed)
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(express.static("public")); // Serve static files from the "public" directory

app.get("/", checkAuth, (req, res) => {
  // console.log(req.headers)
  if (req.user.role == "worker") {
    return res.redirect("/worker");
  }
  if (req.user.role == "client") {
    return res.redirect("/client");
  }
});

app.use("/home", checkAuthHome, authControl);

app.use(
  "/client",
  checkAuth,

  (req, res, next) => {
    if (req.user.role == "client") {
      next();
    }
  },

  clientRoute
);
app.use(
  "/worker",
  checkAuth,
  (req, res, next) => {
    if (req.user.role == "worker") {
      next();
    }
  },
  workerRoute
);

// Starting the Server
app.listen(PORT, () => {
  ConnectDB();
  console.log(`✅ Server is running and listening at http://localhost:${PORT}`);
});

// Developer Notes
/**
 * 1. Ensure `.env` file contains the PORT variable if custom port is required.
 * 2. Use `authControlRouter.js` for all authentication-related routes.
 * 3. Follow the MVC architecture:
 *    - Models: Define data schemas and business logic.
 *    - Views: Use EJS templates for rendering the UI.
 *    - Controllers: Handle route logic and interactions between models and views.
 * 4. Add additional routers for modularizing other features (e.g., user management, API endpoints).
 */
