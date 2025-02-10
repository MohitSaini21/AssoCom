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

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  CheckRequestTypeForGoogle, // Redirect to home on failure
  GoogleSignup
);

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

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    session: false, // Request access to profile and email
  })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/", session: false }),
  FacebookSignup
);

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get("/", (req, res) => {
  return res.render("auth/home.ejs"); // Render the home.ejs view
});

router.get("/signup", (req, res) => {
  return res.render("auth/signup.ejs"); // Render the signup.ejs view
});

router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/home/signup",
    session: false,
  }), // Redirect to home on failure
  CheckRequestType,
  GithubSignup // Call controller function to handle signup logic
);

export const authControl = router;
