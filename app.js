// Importing Required Modules
import express from "express"; // Core framework for building the server
import { config } from "dotenv"; // For environment variable management
import { authControl } from "./routers/authControlRouter.js"; // Importing the authentication router
import ejs from "ejs";
import { decryptData } from "./utils/Crypto.js";
import http from "http";
import { cwsRoute } from "./routers/cws.js";
import chatMessage from "./models/messages.js";
import { writeFile } from "fs/promises";

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
  return res.redirect("/CWS");
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

app.use(
  "/CWS",
  checkAuth,
  (req, res, next) => {
    if (req.user.role == "worker" || req.user.role == "client") {
      next();
    }
  },
  cwsRoute
);

// Import the HTTP module

// Create HTTP server and pass the app handler
const server = http.createServer(app);

import { Server } from "socket.io";

const activeConversations = {}; // To track active conversations (userId => conversationId)
const socketIDS = {};

const io = new Server(server);

// Socket.IO Connection and Event Handling
// Socket.IO Connection and Event Handling
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // Get userId from handshake query
  const recipient = socket.handshake.query.recipient; // Get recipient from handshake query
  let name = userId.concat(recipient);

  socketIDS[name] = socket.id;
  activeConversations[name] = name;

  // all events handlers
  socket.on("sendMessage", (data) => {
    const { userId, recipient, content } = data;
    console.log(`Message from ${userId} to ${recipient}: ${content}`);

    let isExist = false; // Start with false to assume the recipient isn't connected

    Object.entries(activeConversations).forEach(([key, value]) => {
      if (
        key === recipient.concat(userId) &&
        value === recipient.concat(userId)
      ) {
        const recipientSocketId = socketIDS[recipient.concat(userId)];

        if (recipientSocketId) {
          // If recipient is connected, forward the message
          io.to(recipientSocketId).emit("receiveMessage", {
            sender: userId,
            content: content,
          });
          isExist = true;
          console.log(`Message sent to ${recipient}`);
        }
      }
    });

    // If recipient is not connected, save the message to the database
    if (!isExist) {
      const newMessage = new chatMessage({
        sender: userId,
        recipient,
        content,
      });

      // Save the new message to the database using .then()
      newMessage
        .save()
        .then((savedMessage) => {
          console.log("Message saved:", savedMessage);
        })
        .catch((error) => {
          console.error("Error saving message:", error);
        });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket with ID ${socket.id} disconnected`);

    // Remove the socket id mapping when user disconnects
    for (const name in socketIDS) {
      if (socketIDS[name] === socket.id) {
        delete socketIDS[name]; // Clean up the socket ID for the disconnected user
        // Clean up active conversation for the disconnected user
        delete activeConversations[name];
        console.log(`Cleaned up conversation for ${name}`);
        console.log(`Removed  ${name} from socket mapping`);
        break;
      }
    }
  });
});

// Starting the Server
server.listen(PORT, () => {
  ConnectDB();
  console.log(`✅ Server is running and listening at http://localhost:${PORT}`);
});
