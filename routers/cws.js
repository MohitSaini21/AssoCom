import express from "express";
import User from "../models/userSchema.js";
import Feedback from "../models/feedBack.js";


import rateLimit from "express-rate-limit";
const router = express.Router();

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
    return res.redirect("/login"); // Redirect to login page (or homepage if preferred)
  }

  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    // If user is not found, clear the cookie and redirect to login page
    res.clearCookie("authToken");
    return res.redirect("/login"); // Redirect to login page
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
  limiter,

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

      // Collect feedback and rating from the request body
      let { feedback, rating } = req.body;

      // Validate feedback length (max 70 words)
      const wordCount = feedback.split(/\s+/).length; // Split feedback by spaces and count words
      if (wordCount > 70) {
        return res.status(400).json({
          message: "Feedback is too long. Please limit it to 70 words.",
        });
      }

      rating = Number(rating); // Convert to a number

      if (
        !feedback ||
        typeof feedback !== "string" ||
        !rating ||
        typeof rating !== "number" ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({ message: "Invalid feedback or rating" });
      }

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
  // The `authToken` cookie is cleared to log the user out of the session
  res.clearCookie("authToken");
  return res.redirect("/");
});

export const cwsRoute = router;
