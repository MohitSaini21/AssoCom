// Importing required modules
import express from "express";
import User from "../models/userSchema.js"; // User schema for database operations
const router = express.Router();

import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";
import { CheckRequestType } from "../middlwares/CheckinRequestType.js";
import { GoogleSignup } from "../controllers/auth.js";

import { FacebookSignup } from "../controllers/auth.js";
import { CheckRequestTypeForGoogle } from "../middlwares/checkRequestTypeForGoogle.js";
import jwt from "jsonwebtoken";

import { GithubSignup } from "../controllers/auth.js"; // Controller functions for handling authentication

import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2"; // GitHub OAuth strategy for Passport.js
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { Strategy as FacebookStrategy } from "passport-facebook";
import { config } from "dotenv";

// import { JsonWebTokenError } from "jsonwebtoken";

config(); // Load environment variables from .env file

// ======================== Passport.js Configuration ========================
// Configuring Passport.js to use the GitHub OAuth strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: "Ov23litEUX71QycQFqjK", // GitHub OAuth client ID
      clientSecret: "3bcc667b5c4813ae33894c1afb7eb7feb7f77134", // GitHub OAuth client secret
      callbackURL: "https://assocom.onrender.com/home/auth/github/callback", // Redirect URL after GitHub authentication
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!accessToken) {
          // Token missing or expired
          return done(null, false, {
            message: "Access token expired. Please sign in again.",
          });
        }

        let email = "No public email";

        // Check if email is directly available in the profile
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        } else {
          // Fetch email manually using GitHub API if not in the profile
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `token ${accessToken}`,
              "User-Agent": "Node.js App",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch emails from GitHub.");
          }

          const emails = await response.json();

          // Extract the primary email if available
          const primaryEmail = emails.find((e) => e.primary);
          if (primaryEmail) {
            email = primaryEmail.email;
          }
        }

        // Attach the email to the profile object for further use
        profile.email = email;

        return done(null, profile); // Pass the profile to the next middleware
      } catch (error) {
        return done(error, null); // Handle errors gracefully
      }
    }
  )
);

// google stragetizy
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "29767625511-l8v39chr3rp3udglimgj4le5s82scdn9.apps.googleusercontent.com", // Your Google Client ID
      clientSecret: "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", // Your Google Client Secret
      callbackURL: "https://assocom.onrender.com/home/auth/google/callback", // Callback URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Initialize the user object with basic profile data
        let user = {
          id: profile.id,
          displayName: profile.displayName,
          username:
            `${profile.name.givenName} ${profile.name.familyName}` ||
            "No username", // Fallback if username is not available
          email:
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : "No public email", // Email (if available)
          imageUrl:
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : null, // Profile image URL
        };

        // If you want to fetch additional user data, you can do that here as well, but we’re focusing on the profile data.

        // Return the user data to the next middleware
        return done(null, user);
      } catch (error) {
        return done(error, null); // Handle errors
      }
    }
  )
);

// goggle routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // Request access to profile and email
  })
);

// Callback route after user authenticates with Google
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  CheckRequestTypeForGoogle, // Redirect to home on failure
  GoogleSignup
);

// facebook

passport.use(
  new FacebookStrategy(
    {
      clientID: "606953095270169", // Your Facebook App ID
      clientSecret: "ef3c23d1f75ca1cf38bf1dfec3c9ebd6", // Your Facebook App Secret
      callbackURL: "https://assocom.onrender.com/home/auth/facebook/callback", // The callback URL
      profileFields: ["id", "displayName", "photos"], // Only requesting id, displayName, and photos (imageUrl)
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Create a user object with the data received from Facebook
        let user = {
          id: profile.id,
          displayName: profile.displayName,
          imageUrl:
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : null, // Image URL
        };

        // Return the user data to the next middleware
        return done(null, user);
      } catch (error) {
        return done(error, null); // Handle errors
      }
    }
  )
);

// Route for Facebook login
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    session: false, // Request access to profile and email
  })
);

// Callback route after Facebook login
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/", session: false }),
  FacebookSignup
);

// ======================== Routes ========================

// GitHub Authentication Route
// Initiates GitHub OAuth login process
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

// This route renders the home page of the application.
router.get("/", (req, res) => {
  return res.render("auth/home.ejs"); // Render the home.ejs view
});

// GitHub OAuth Callback Route
// This route is called after the user authenticates with GitHub
router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/home/signup",
    session: false,
  }), // Redirect to home on failure
  CheckRequestType,
  GithubSignup // Call controller function to handle signup logic
);

// Compelting user profiel who has signedup through the github Account
//GEt
// GET route to render the profile completion page
router.get("/fillRole/:userId", (req, res) => {
  const { userId } = req.params;
  return res.render("auth/profileC.ejs", { userId });
});

// POST
// POST route to handle the role submission

router.post("/fillRole/:userId", async (req, res) => {
  try {
    // Step 1: Retrieve the JWT token from the cookies
    const token = req.cookies.ProfileUpdate;

    if (!token) {
      return res.status(401).json({
        errors: ["No authentication token found. Please log in again."],
      });
    }

    // Step 2: Verify the token and extract the userId
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "Secret String"); // Secret key to verify the token
    } catch (error) {
      return res.status(401).json({
        errors: ["Invalid or expired token. Please log in again."],
      });
    }

    // Step 3: Extract the userId from the decoded token
    const { userId } = decodedToken;
    console.log(userId);

    // Step 4: Check if required fields (role, college) are present in the request body
    const { college, role } = req.body;
    if (!role || !college) {
      return res.status(400).json({
        errors: ["The role and college fields are required."],
      });
    }

    // Step 5: Find the user in the database using the userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        errors: ["User not found. Please verify the user ID and try again."],
      });
    }

    // Step 6: Update the user's role and college
    user.role = role;
    user.collegeName = college;
    await user.save();

    // Step 7: Delete the authToken cookie after successful update
    res.clearCookie("ProfileUpdate", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure it works for secure cookies in production
      sameSite: "Strict",
    });

    // Step 8: Send a response indicating successful profile update
    generateTokenAndSetCookie(res, user._id, role);
    return res.status(201).json({
      success: true,
      message: "The role has been successfully updated for the user.",
    });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    return res.status(500).json({
      errors: ["An internal server error occurred. Please try again later."],
    });
  }
});

// ======================== Notes for Teammates ========================
// 1. **Environment Variables**:
//    Ensure you have a .env file with the following keys:
//    - GITHUB_CLIENT_ID: Your GitHub OAuth App Client ID
//    - GITHUB_CLIENT_SECRET: Your GitHub OAuth App Client Secret
//
// 2. **Views**:
//    The views (e.g., home.ejs, signin.ejs, signup.ejs) need to be created in the views folder.
//
// 3. **Database Integration**:
//    - The User model (../models/userSchema.js) should be implemented to handle user data.
//    - Ensure MongoDB is properly connected to save user data.
//
// 4. **Error Handling**:
//    - Add proper error handling for routes and database operations.
//    - Use middleware to catch and handle errors gracefully.
//
// 5. **GitHub OAuth**:
//    - Make sure the callback URL matches the one configured in your GitHub OAuth App.
//    - Use HTTPS in production for secure communication.

// Exporting the router to use in the main app.js file
export const authControl = router;
