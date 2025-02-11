import express from "express";
import User from "../models/userSchema.js";
import Project from "../models/projectSchema.js";
import Bid from "../models/offerSchema.js";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import { ValidatorBid } from "../middlwares/Bid.js";
import { ValidatorUserProfile } from "../middlwares/profile.js";

import { filterBody } from "../middlwares/filter.js";
import Message from "../models/mesg.js";

import { generateUniqueMessage } from "../utils/GenereteMesg.js";
import { sendNotificationToClient } from "../utils/notify.js";
const Blimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  max: 5, // Maximum submissions allowed
  message: "You can only make  5 bids  every 1 day. Please try again later.", // Custom message for rate-limited users
  keyGenerator: (req) => req.user.id || req.ip, // Use user ID or IP as the key
  standardHeaders: true, // Include rate-limit information in the response headers
  legacyHeaders: false, // Disable the legacy rate-limit headers

  // This function is executed whenever a user exceeds the rate limit
  handler: (req, res) => {
    const remainingTime = req.rateLimit.resetTime - Date.now(); // Time until the limit resets
    res.status(429).json({
      message:
        "You can only make  5 bids  every 1 day. Please try again later..", // Updated message for rate-limited users
      remainingTime: remainingTime, // Time remaining until reset in ms
      resetAt: new Date(req.rateLimit.resetTime).toISOString(), // When the limit will reset
    });
  },
});
const Plimiter = rateLimit({
  windowMs: 3 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
  max: 2, // Maximum submissions allowed
  message: "You can only update your profile 2 itmes in 3 days", // Custom message for rate-limited users
  keyGenerator: (req) => req.user.id || req.ip, // Use user ID or IP as the key
  standardHeaders: true, // Include rate-limit information in the response headers
  legacyHeaders: false, // Disable the legacy rate-limit headers

  // This function is executed whenever a user exceeds the rate limit
  handler: (req, res) => {
    const remainingTime = req.rateLimit.resetTime - Date.now(); // Time until the limit resets
    res.status(429).json({
      message: "you can only update your profile 2 itmes in 3 days", // Updated message for rate-limited users
      remainingTime: remainingTime, // Time remaining until reset in ms
      resetAt: new Date(req.rateLimit.resetTime).toISOString(), // When the limit will reset
    });
  },
});

const router = express.Router();
// Get Request page renderere
// sotrrgae configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/profileImages/`));
  },
  filename: function (req, file, cb) {
    const FileName = `${Date.now()}-${file.originalname}`;
    cb(null, FileName);
  },
});

const UploadingProfileImage = multer({ storage: storage });

function reduceArray(arr) {
  if (arr.length <= 6) {
    return arr;
  }

  targetSize = Math.floor(arr.length / 2);

  // Create a new array to store the randomly selected elements
  const reducedArray = [];

  // Make a copy of the original array to avoid modifying it
  const arrCopy = [...arr];

  // Randomly pick targetSize elements
  for (let i = 0; i < targetSize; i++) {
    const randomIndex = Math.floor(Math.random() * arrCopy.length);
    reducedArray.push(arrCopy[randomIndex]);
    // Remove the element from the array to avoid picking it again
    arrCopy.splice(randomIndex, 1);
  }

  return reducedArray;
}

router.post(
  "/profile",
  UploadingProfileImage.single("profileImage"),
  async (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    if (req.file) {
      const profilePicturePath = "/profileImages/".concat(req.file.filename);
      req.body.profilePicturePath = profilePicturePath;
    }

    next();
  },
  ValidatorUserProfile,
  Plimiter,
  filterBody,

  async (req, res) => {
    try {
      // Extract data from the request body
      const { bio, snapID, instaID, twitterID, githubID } = req.body;

      // Construct the update object
      const updateData = {
        "profile.bio": bio || "Tell us about yourself!",
        "profile.snapID": snapID,
        "profile.instaID": instaID,
        "profile.twitterID": twitterID,
        "profile.githubID": githubID,
      };

      // If a profile picture is uploaded, update the profile picture path
      if (req.file) {
        updateData["profile.profilePicture"] = req.body.profilePicturePath;
      }

      // Update the user's profile in the database
      const userId = req.user.id; // Assuming `req.user` contains authenticated user's data
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true } // Return the updated document and validate inputs
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(201).json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res
        .status(500)
        .json({ message: `Server Error: ${error.message}` });
    }
  }
);

// #important
router.get("/GetProjectPage", async (req, res) => {
  const workerID = req.user.id; // Get the worker's ID from the logged-in user
  const user = await User.findById(workerID);

  return res.json({ ...user });
  try {
    // Fetch all projects and populate the postedBy field to get the user's full name
    let projects = await Project.find({}).populate(
      "postedBy",
      "collegeName profile"
    );

    // Filter out projects where the worker has already made a bid (workerID is in bidsMade)
    projects = projects.filter((project) => {
      return !project.bidsMade.includes(workerID);
    });

    // college filteration you may off or on

    projects = projects.filter((project) => {
      return project.postedBy.collegeName === user.collegeName;
    });
    // college filteration you may off or on

    // Filter out projects where the number of bids exceeds the limit (5 bids)
    projects = projects.filter((project) => {
      return project.bidsMade.length < 5;
    });

    projects = reduceArray(projects);
    const messages = await Message.find({ userId: req.user.id });

    // Check if there are any unseen messages
    const isUnseen = messages.some((message) => message.status === "unseen");

    return res.render("Dash/workerDash/getProject.ejs", {
      user,
      projects,
      isUnseen,
    });
  } catch (error) {
    console.log(error.message);

    return res.send(error.message);
  }
});
router.get("/GetAllProjectPage", async (req, res) => {
  const workerID = req.user.id; // Get the worker's ID from the logged-in user
  const user = await User.findById(workerID);
  try {
    // Fetch all projects and populate the postedBy field to get the user's full name
    let projects = await Project.find({}).populate(
      "postedBy",
      "collegeName profile"
    );

    // Filter out projects where the worker has already made a bid (workerID is in bidsMade)
    projects = projects.filter((project) => {
      return !project.bidsMade.includes(workerID);
    });

    // Filter out projects where the number of bids exceeds the limit (5 bids)
    projects = projects.filter((project) => {
      return project.bidsMade.length < 5;
    });

    projects = reduceArray(projects);
    const messages = await Message.find({ userId: req.user.id });

    // Check if there are any unseen messages
    const isUnseen = messages.some((message) => message.status === "unseen");
    return res.render("Dash/workerDash/getProject.ejs", {
      user,
      projects,
      isUnseen,
    });
  } catch (error) {
    return res.redirect("/home");
  }
});

router.get("/MakeBid/:projectID/:expiresAt", async (req, res) => {
  const workerID = req.user.id; // Get the worker's ID from the logged-in user
  const { projectID, expiresAt } = req.params;
  const project = await Project.findById(projectID);

  const user = await User.findById(workerID);
  const messages = await Message.find({ userId: req.user.id });

  // Check if there are any unseen messages
  const isUnseen = messages.some((message) => message.status === "unseen");

  return res.render("Dash/workerDash/makeBid.ejs", {
    user,
    projectID,
    expiresAt,
    project,
    isUnseen,
  });
});

// #important
router.post(
  "/MakeBid/:projectID/:expiresAt",
  ValidatorBid,
  async (req, res, next) => {
    // Extract the projectID from the route parameters
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
    const { projectID, expiresAt } = req.params;

    const { amount, description, deadline } = req.body;
    const workerID = req.user.id;

    const worker = await User.findById(workerID);
    if (!worker.profile.snapID || !worker.profile.instaID) {
      return res.status(400).json({
        success: false,
        redirect: true,
        errors: [
          `Hey ${worker.userName} pls compelete your profile details that client might rreach you through`,
        ],
      });
    }

    // Find the project by its ID
    const project = await Project.findById(projectID);

    // Check if the project exists
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found and it must have expired",
      });
    }

    // Check if the worker has already made a bid for this project
    if (project.bidsMade && project.bidsMade.includes(workerID)) {
      return res.status(400).json({
        success: false,
        errors: ["You have already made a bid for this project."],
      });
    }

    next();
  },
  Blimiter,
  filterBody,
  async (req, res) => {
    try {
      // Extract the projectID from the route parameters
      const { projectID, expiresAt } = req.params;
      const workerID = req.user.id;

      const { amount, description, deadline } = req.body;

      // Find the project by its ID
      const project = await Project.findById(projectID);
      const client = await User.findById(project.postedBy);
      const worker = await User.findById(workerID);

      // Create a new bid using the Bid model (this will save it to the database)
      const bid = await Bid.create({
        amount, // The amount the worker is bidding
        description, // A description of the bid or the worker's approach
        deadline, // The deadline the worker can meet for the project
        project: projectID, // The ID of the project the worker is bidding for
        worker: workerID, // The ID of the worker making the bid,
        expiresAt,
      });

      // Add the worker's ID to the bidsMade array in the Project document to track the bid
      project.bidsMade.push(workerID);
      await project.save();

      // Return a success response

      // Sample data
      const payload = {
        client: client.userName,
        worker: worker.userName,
        assignment_title: project.assignment_title,
      };
      const message = generateUniqueMessage(payload);

      if (client.Ntoken) {
        sendNotificationToClient(client.Ntoken, message);
      }
      const newMessage = await Message.create({
        userId: client._id,
        idUser: worker._id,
        messageContent: message,
        purpose: "offer",
        expiresAt: project.expiresAt,
      });

      return res.status(201).json({
        success: true,
        message: "Bid successfully submitted!",
        bid: bid, // Include the newly created bid details in the response
        projectID: projectID, // Return the project ID so the client knows which project the bid was for
        workerID: workerID, // Return the worker's ID as well
      });
    } catch (error) {
      // Return a 500 server error response if something goes wrong
      return res.status(500).json({
        success: false,
        message: "Something Went Wrong pls Try Again Later",
        error: error.message,
      });
    }
  }
);

// worker's offers

router.get("/OfferPage", async (req, res) => {
  const worker = req.user.id; // Get the worker's ID from the logged-in user
  const user = await User.findById(worker);

  // Find bids by the worker that have a project with a non-null/valid value
  let offers = await Bid.find({ worker })
    .populate("project", "assignment_title description student_name postedBy") // Include value of the project in populate
    .populate("worker", "name email") // Populating only necessary fields from the User model (worker)
    .exec();

  const messages = await Message.find({ userId: req.user.id });

  // Check if there are any unseen messages
  const isUnseen = messages.some((message) => message.status === "unseen");
  return res.render("Dash/workerDash/offers.ejs", { user, offers, isUnseen });
});

router.get("/editProfile", async (req, res) => {
  const user = await User.findById(req.user.id);
  const messages = await Message.find({ userId: req.user.id });

  // Check if there are any unseen messages
  const isUnseen = messages.some((message) => message.status === "unseen");
  return res.render("Dash/workerDash/editProfile.ejs", { user, isUnseen });
});

import mongoose from "mongoose";

router.get("/deleteOffer/:offerId/:projectId/:workerID", async (req, res) => {
  try {
    const { offerId, projectId, workerID } = req.params;

    // Find the bid (offer) by its ObjectId
    const bid = await Bid.findById(offerId);
    if (!(bid.status == "pending")) {
      return res.redirect("/");
    }

    // Find the project by its ObjectId
    const project = await Project.findById(projectId);

    // Remove the worker's ID from bidsMade array if rejected

    project.bidsMade = project.bidsMade.filter(
      (worker) => worker.toString() !== workerID.toString()
    );

    await project.save();

    // Delete the bid (offer) from the datab  ase
    if (bid) {
      await Bid.deleteOne({ _id: offerId });
    }

    return res.redirect("/worker/OfferPage");
  } catch (error) {
    return res.redirect("/worker/OfferPage");
  }
});

export const workerRoute = router;
