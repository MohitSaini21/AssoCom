import express from "express";
import User from "../models/userSchema.js";
import Feedback from "../models/feedBack.js";
import { ValidatorFeedback } from "../middlwares/feedback.js";
import rateLimit from "express-rate-limit";
const router = express.Router();
import Message from "../models/mesg.js";
import { filterBody } from "../middlwares/filter.js";
import chatMessage from "../models/messages.js";
import { sendNotificationToWorker } from "../utils/notify.js";
import Project from "../models/projectSchema.js";

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
  const messages = await Message.find({ userId: req.user.id });

  // Check if there are any unseen messages
  const isUnseen = messages.some((message) => message.status === "unseen");

  return res.render("Dash/sharedDash/index.ejs", { user, isUnseen });
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
  const messages = await Message.find({ userId: req.user.id });

  // Check if there are any unseen messages
  const isUnseen = messages.some((message) => message.status === "unseen");
  return res.render("Dash/sharedDash/feedback.ejs", { user, isUnseen });
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

  const messages = await Message.find({ userId: req.user.id });

  // Check if there are any unseen messages
  const isUnseen = messages.some((message) => message.status === "unseen");

  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    // If user is not found, clear the cookie and redirect to login page
    res.clearCookie("authToken");
    return res.redirect("/login"); // Redirect to login page
  }

  return res.render("Dash/sharedDash/profile.ejs", { user, isUnseen });
});
router.get("/logout", async (req, res) => {
  try {
    // Ensure `req.user.id` exists
    if (!req.user || !req.user.id) {
      return res.status(401).send("Unauthorized: User not logged in.");
    }

    const userId = req.user.id;

    // Clear cookies
    res.clearCookie("pageLoaded");
    res.clearCookie("notifPermissionPageLoaded");
    res.clearCookie("authToken");

    // Find the user by ID and remove the Ntoken
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Update the user's Ntoken to null or remove it
    user.Ntoken = null; // Set to null
    await user.save(); // Save changes to the database

    console.log(
      `User ${user.userName} (${user.email}) logged out successfully.`
    );

    // Redirect to the homepage
    return res.redirect("/");
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).send("An error occurred while logging out.");
  }
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

// mesg
// Route to show inbox messages
router.get("/Inbox", async (req, res) => {
  // Check if the user is authenticated via the middleware
  if (!req.user || !req.user.id) {
    // If not authenticated, clear the cookie and redirect to login page
    res.clearCookie("authToken"); // Clear the authentication token cookie
    return res.redirect("/login"); // Redirect to login page
  }

  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      // If user is not found, clear the cookie and redirect to login page
      res.clearCookie("authToken");
      return res.redirect("/login"); // Redirect to login page
    }

    const messages = await Message.find({ userId })
      .populate("idUser", "userName") // Populate only the 'username' field of the user document
      .exec();

    // Filter unseen messages
    // Check if there are any unseen messages

    const unseenMessages = messages.filter(
      (message) => message.status === "unseen"
    );

    // Change the status of "unseen" messages to "seen"
    if (unseenMessages.length > 0) {
      await Message.updateMany(
        { userId, status: "unseen" },
        { $set: { status: "seen" } } // Update status to "seen"
      );
    }

    // Render the inbox page and pass the user and messages to the view
    return res.render("Dash/sharedDash/inbox.ejs", {
      user,
      messages,
      isUnseen: false,
    });
  } catch (error) {
    console.error("Error fetching inbox messages:", error);
    res.status(500).send("Server Error");
  }
});

// DELETE message route
router.post("/delete-message/:id", async (req, res) => {
  try {
    const messageId = req.params.id;

    // Delete the message from the database
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (deletedMessage) {
      return res.status(200).json({ success: true });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/chatSection/:buddyID/:projectID", async (req, res) => {
  try {
    const { buddyID, projectID } = req.params;
    const project = await Project.findById(projectID);
 
    
    if (!project) {
      return res.redirect("/");
    }

    // Fetch the logged-in user (you)
    const you = await User.findById(req.user.id);

    // Fetch the buddy user (recipient)
    const buddy = await User.findById(buddyID);

    if (!buddy) {
      return res.status(404).json({ message: "Buddy not found." });
    }

    // Fetch all **unseen** messages between the logged-in user (req.user.id) and the buddy (buddyID)
    let messages = await chatMessage
      .find({
        $or: [
          { sender: req.user.id, recipient: buddyID },
          { sender: buddyID, recipient: req.user.id },
        ],
      })
      .sort({ timestamp: 1 }); // Sort messages by timestamp (ascending)

    // lets create  a filter for the unseen mesages

    for (let message of messages) {
      if (
        message.recipient.toString() === req.user.id.toString() &&
        message.status === "unseen"
      ) {
        // Update the status of the message to "seen"
        await chatMessage.deleteMany(
          { _id: message._id } // Find the message by its _id
        );
      }
    }
    messages = messages.filter((message) => message.status !== "seen");

    // Render the chat page with the buddy, logged-in user, and messages
    return res.render("Dash/sharedDash/chatSection.ejs", {
      buddy,
      you,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.redirect("/"); // Redirect in case of an error
  }
});

export const cwsRoute = router;
