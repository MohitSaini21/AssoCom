import https from "https"; // Import https module
import fs from "fs"; // Import fs module for reading files

// Importing other required modules
import express from "express";
import { config } from "dotenv";
import { authControl } from "./routers/authControlRouter.js";
import ejs from "ejs";
import { decryptData } from "./utils/Crypto.js";
import { cwsRoute } from "./routers/cws.js";
import cron from "node-cron";
import passport from "passport";
import cookieParser from "cookie-parser";
import { ConnectDB } from "./config/db.js";
import { checkAuth } from "./middlwares/checkAuthDash.js";
import { checkAuthHome } from "./middlwares/checkHome.js";
import User from "./models/userSchema.js";
import { clientRoute } from "./routers/client.js";
import { workerRoute } from "./routers/worker.js";
import helmet from "helmet"; // Import helmet for security headers

// Load Environment Variables
config();
const PORT = process.env.PORT || 8000;

const app = express();

// Use helmet to set security-related HTTP headers
app.use(helmet());

// Specifically enable HSTS (HTTP Strict Transport Security)
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Optional: Add the site to the HSTS preload list
  })
);

// Force HTTP to HTTPS redirect
app.use((req, res, next) => {
  if (req.protocol === "http") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Schedule the task to run every day at midnight
const cleanupUnverifiedUsers = async () => {
  try {
    const now = new Date();

    const usersToDelete = await User.find({
      isEmailVerified: false,
      createdAt: { $lt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
    });

    if (usersToDelete.length > 0) {
      console.log(`Found ${usersToDelete.length} unverified users to delete`);

      for (const user of usersToDelete) {
        const userInDb = await User.findById(user._id);
        if (!userInDb.isEmailVerified) {
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

const httpsOptions = {
  key: fs.readFileSync("C:/ssl/private.key"), // Path to your private key
  cert: fs.readFileSync("C:/ssl/certificate.crt"), // Path to your certificate
  passphrase: "misbaansari20", // Add your private key passphrase here
};

// Initialize Passport
app.use(passport.initialize());
app.use(cookieParser());

// Middleware and Settings
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", checkAuth, (req, res) => {
  console.log("Check");
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

// Start HTTPS Server
https.createServer(httpsOptions, app).listen(PORT, () => {
  ConnectDB();
  console.log(
    `✅ HTTPS Server is running and listening at https://localhost:${PORT}`
  );
});
