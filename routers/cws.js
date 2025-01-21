import express from "express";
import User from "../models/userSchema.js";
import Feedback from "../models/feedBack.js";
import { ValidatorFeedback } from "../middlwares/feedback.js";
import rateLimit from "express-rate-limit";
const router = express.Router();
import { filterBody } from "../middlwares/filter.js";

const limiter = rateLimit({
  windowMs: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
  max: 3, // Maximum submissions allowed
  message:
    "You can only submit feedback 3 times every 3 days. Please try again later.", // Custom message for rate-limited users
  keyGenerator: (req) => req.user.id || req.ip, // Use user ID or IP as the key
  standardHeaders: true, // Include rate-limit information in the response headers
  legacyHeaders: false, // Disable the legacy rate-limit headers

  // This function is executed whenever a user exceeds the rate limit
  handler: (req, res) => {
    const remainingTime = req.rateLimit.resetTime - Date.now(); // Time until the limit resets
    res.status(429).json({
      message:
        "You can only submit feedback 3 times every 3 days. Please try again later.", // The message from the rate limiter
      remainingTime: remainingTime, // Time remaining until reset in ms
      resetAt: new Date(req.rateLimit.resetTime).toISOString(), // When the limit will reset
    });
  },
});
router.get("/", async (req, res) => {
  // Check if the user is authenticated via the middleware
  if (!req.user || !req.user.id) {
    // If not authenticated, clear the cookie and redirect to login page
    res.clearCookie("authToken"); // Clear the authentication token cookie
    return res.redirect("/home"); // Redirect to login page (or homepage if preferred)
  }

  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    // If user is not found, clear the cookie and redirect to login page
    res.clearCookie("authToken");
    return res.redirect("/home"); // Redirect to login page
  }

  return res.render("Dash/sharedDash/index.ejs", { user });
});
router.get("/feedBack", async (req, res) => {
  // Check if the user is authenticated via the middleware
  if (!req.user || !req.user.id) {
    // If not authenticated, clear the cookie and redirect to login page
    res.clearCookie("authToken"); // Clear the authentication token cookie
    return res.redirect("/login"); // Redirect to login page (or homepage if preferred)
  }

  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    // If user is not found, clear the cookie and redirect to login page
    res.clearCookie("authToken");
    return res.redirect("/login"); // Redirect to login page
  }

  return res.render("Dash/sharedDash/feedback.ejs", { user });
});
// Route to submit feedback (POST)
router.post(
  "/feedBack",
  ValidatorFeedback,
  limiter,
  filterBody,

  async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        // If not authenticated, clear the cookie and respond with 401 status code
        res.clearCookie("authToken"); // Clear the authentication token cookie
        return res
          .status(401)
          .json({ message: "Unauthorized. Please log in again." }); // Respond with 401 status code
      }

      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        // If user is not found, clear the cookie and respond with 401 status code
        res.clearCookie("authToken");
        return res
          .status(401)
          .json({ message: "User not found. Please log in again." }); // Respond with 401 status code
      }
      let { feedback, rating } = req.body;

      // Create a new feedback document
      const newFeedback = new Feedback({
        feedback,
        rating,
        givenBy: userId, // Set the user ID (givenBy) from the authenticated user
      });

      // Save the feedback to the database
      await newFeedback.save();

      // Return a success response
      res.status(200).json({ message: "Feedback submitted successfully!" });
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ message: "Server Error you might try later." });
    }
  }
);

router.get("/profile", async (req, res) => {
  // Check if the user is authenticated via the middleware
  if (!req.user || !req.user.id) {
    // If not authenticated, clear the cookie and redirect to login page
    res.clearCookie("authToken"); // Clear the authentication token cookie
    return res.redirect("/login"); // Redirect to login page (or homepage if preferred)
  }

  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    // If user is not found, clear the cookie and redirect to login page
    res.clearCookie("authToken");
    return res.redirect("/login"); // Redirect to login page
  }

  return res.render("Dash/sharedDash/profile.ejs", { user });
});
router.get("/logout", (req, res) => {
  // Clear the pageLoaded cookie (or set it to a specific value if you want to control the pop-up behavior)
  res.clearCookie("pageLoaded");
  res.clearCookie("notifPermissionPageLoaded");
  res.clearCookie("authToken");
  return res.redirect("/");
});

// Route to save the FCM token
router.post("/api/save-fcm-token", async (req, res) => {
  try {
    const { token } = req.body; // Get the token from the request body
    const userId = req.user.id; // Assuming `req.user.id` is populated from the auth middleware

    if (!token) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    // Find the user and update the FCM token
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's FCM token (you can store multiple tokens if needed)
    user.Ntoken = token;
    await user.save(); // Save the user with the new token

    res.status(200).json({ message: "FCM token saved successfully" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export const cwsRoute = router;
