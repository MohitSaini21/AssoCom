// Importing required modules
import express from "express";
import User from "../models/userSchema.js"; // User schema for database operations
const router = express.Router();
import { decryptData, encrypt } from "../utils/Crypto.js";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";
import { CheckRequestType } from "../middlwares/CheckinRequestType.js";
import jwt from "jsonwebtoken";

import { ValidatorSignup } from "../middlwares/validatorSignup.js";
import {
  GithubSignup,
  signupHandler,
  SiginHandler,
  GithubSignin,
} from "../controllers/auth.js"; // Controller functions for handling authentication
import { validateAndSanitizeSignInPayload } from "../middlwares/validatorSignin.js";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2"; // GitHub OAuth strategy for Passport.js
import { config } from "dotenv";
import { sendResetLink } from "../mailer/mailer.js";
// import { JsonWebTokenError } from "jsonwebtoken";

function generateNumericCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10); // Append random digit (0-9)
  }
  return code;
}
// Rate limiter middleware (limit to 2 requests per 3 minutes)
const forgotPasswordLimiter = rateLimit({
  windowMs: 3 * 24 * 60 * 60 * 1000, // day
  max: 3, // Limit each IP to 2 requests per `windowMs`
  message: "Too many requests from this IP, please try again after 3 days.",
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again after 3 days",
    });
  },
});
// Setup the rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow only 5 login attempts per IP address in the time window
  message: "Too many login attempts, please try again 15 minutes later.",
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many login attempts, please try again 15 minutes later.",
    });
  },
});
const singupLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 15 minutes
  max: 4, // Allow only 5 login attempts per IP address in the time window
  message: "Too many signup attempts, please try again 1 day later.",
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many signup attempts, please try again 1 day later.",
    });
  },
});

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

// ======================== Routes ========================

// Home Page Route
// This route renders the home page of the application.
router.get("/", (req, res) => {
  return res.render("auth/home.ejs"); // Render the home.ejs view
});

// Signin Page Route
// This route renders the signin page where users can log in.
router.get("/signin", (req, res) => {
  return res.render("auth/signin.ejs"); // Render the signin.ejs view
});

// Signup Page Route
// This route renders the signup page where new users can register.
router.get("/signup", (req, res) => {
  return res.render("auth/signup.ejs"); // Render the signup.ejs view
});

// POST: Handle User Signin
// This route handles user authentication (e.g., login functionality).
router.post(
  "/signin",
  validateAndSanitizeSignInPayload,
  loginLimiter,
  SiginHandler
);

router.post("/signinGithub", GithubSignin);

// POST: Handle User Signup
// This route handles user registration and saves new users to the database.
router.post("/signup", ValidatorSignup, singupLimiter, signupHandler);

// GitHub Authentication Route
// Initiates GitHub OAuth login process
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

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

// Forgot Password Page Route
router.get("/forgot-password", (req, res) => {
  return res.render("auth/forgotPassword.ejs");
});

router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        errors: ["Email is required. Please provide the Email ID."],
      });
    }

    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        errors: ["User with this Email is not registered"],
      });
    }
    if (user.githubId) {
      return res.status(404).json({
        errors: [
          "This account is linked to GitHub. Please use 'Sign in with GitHub' to log in.",
        ],
      });
    }

    // Generate a numeric token (ensure it's secure and unique enough)
    const token = generateNumericCode(); // Ensure this function generates a secure token
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000; // Token expires in 5 minutes

    // Save the user with the reset token and expiry
    await user.save();

    // Send the password reset email with the generated token
    sendResetLink({ token, email });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Password reset email has been sent successfully.",
    });
  } catch (error) {
    console.error("Error during forgot-password request:", error);
    return res.status(500).json({
      errors: [`Server Error. ${error.message}`],
    });
  }
});

router.get("/verifyPasswordToken", (req, res) => {
  return res.render("auth/verifyPasswordToken.ejs");
});
router.post("/verifyPasswordToken", async (req, res) => {
  try {
    const { resetCode } = req.body;

    // Check if the reset code is provided
    if (!resetCode) {
      return res.status(400).render("autherror", {
        title: "Missing Reset Code",
        errorMessage: "Please provide a reset code.",
        errorCode: "400",
        errorType: "Bad Request",
      });
    }

    // Find the user with the reset code
    const user = await User.findOne({ resetPasswordToken: resetCode });

    // If no user is found or the token has expired
    if (!user || Date.now() > user.resetPasswordTokenExpiry) {
      return res.status(400).render("auth/error", {
        title: "Invalid or Expired Reset Code",
        errorMessage:
          "The reset code is either invalid or has expired. Please request a new one.",
        errorCode: "400",
        errorType: "Bad Request",
      });
    }

    // Create a JWT token that expires in 2 minutes
    const token = jwt.sign(
      { userId: user._id },
      "password-key", // Ensure you have a JWT_SECRET environment variable
      { expiresIn: "5m" }
    );

    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    // Render the password change page with the token
    return res.render("auth/passwordChange", {
      token,
      user,
    });
  } catch (error) {
    console.error("Error verifying password reset token:", error);
    return res.status(500).render("auth/error", {
      title: "Server Error",
      errorMessage: "An error occurred while verifying the reset code.",
      errorCode: "500",
      errorType: "Internal Server Error",
    });
  }
});

router.post("/passwordChange", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).render("auth/error", {
        title: "Password Mismatch",
        errorMessage: "The passwords do not match. Please try again.",
        errorCode: "400",
        errorType: "Bad Request",
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, "password-key");

    // Find the user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).render("auth/error", {
        title: "User Not Found",
        errorMessage: "The user could not be found.",
        errorCode: "404",
        errorType: "Not Found",
      });
    }

    // Update the user's password
    user.password = await bcrypt.hash(password, 10);

    await user.save();

    // Render success page or redirect to login
    return res.redirect("/home/signin");
  } catch (error) {
    console.error("Error changing password:", error.message);
    return res.status(500).render("autherror", {
      title: "Server Error",
      errorMessage: "An error occurred while changing the password.",
      errorCode: "500",
      errorType: "Internal Server Error",
    });
  }
});

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

/**
 * GET /verifyEmail/:code
 * Verifies the email using the provided code in the URL path.
 */
router.get("/verifyEmail/:verificationCode", async (req, res) => {
  try {
    const { verificationCode } = req.params;

    // Check if the code is provided
    if (!verificationCode) {
      return res.status(400).render("auth/errorEmailVerification", {
        errorMessage: "Verification code is missing.",
      });
    }

    // Find the user with the provided verification code
    const user = await User.findOne({ verifiedEmailToken: verificationCode });

    if (!user) {
      return res.status(404).render("auth/errorEmailVerification", {
        errorMessage: "Invalid  verification code.",
      });
    }

    // Check if the verification code has expired
    if (user.verifiedEmailTokenExpiry < Date.now()) {
      return res.status(400).render("auth/errorEmailVerification", {
        errorMessage:
          "Verification code has expired. Please request a new one.",
      });
    }

    // Mark the user's email as verified
    user.verifiedEmailToken = null; // Clear the token
    user.verifiedEmailTokenExpiry = null; // Clear the expiry
    user.isEmailVerified = true; // Update the verification status
    await user.save();

    // Render a success page or redirect to a login page
    return res.render("auth/successEmailVerification", {
      successMessage: "Your email has been successfully verified!",
    });
  } catch (error) {
    // Handle unexpected server errors
    console.error("Error verifying email:", error);
    return res.status(500).render("auth/errorEmailVerification", {
      errorMessage: "An unexpected error occurred. Please try again later.",
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
