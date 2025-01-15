import express from "express";
import User from "../models/userSchema.js";
import Project from "../models/projectSchema.js";
import Bid from "../models/offerSchema.js";
import multer from "multer";
import path from "path";
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

router.get("/", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("WorkerDash/home", { user });
});
router.get("/profile", async (req, res) => {
  // return res.send("this is a profile Page")
  const user = await User.findById(req.user.id);
  return res.render("WorkerDash/profile.ejs", { user });
});
router.post(
  "/profile",
  UploadingProfileImage.single("profilePicture"),
  async (req, res) => {
    try {
      if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Please upload a profile picture" });
      }

      console.log("Form Data:", req.body);

      // Construct the profile picture path
      const profilePicturePath = "/profileImages/".concat(req.file.filename);

      // Extract data from the request body
      const { bio, contactNumber, snapID, instaID, twitterID, githubID } =
        req.body;

      // Update the user's profile in the database
      const userId = req.user.id; // Assuming `req.user` contains authenticated user's data
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "profile.bio": bio || "Tell us about yourself!",
            "profile.profilePicture": profilePicturePath,
            "profile.contactNumber": contactNumber,
            "profile.snapID": snapID,
            "profile.instaID": instaID,
            "profile.twitterID": twitterID,
            "profile.githubID": githubID,
          },
        },
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

// Route to handle user logout
router.get("/logout", (req, res) => {
  // Step 1: Clear the authentication cookie
  // The `authToken` cookie is cleared to log the user out of the session
  res.clearCookie("authToken", {
    httpOnly: true, // Ensure the cookie is not accessible via client-side JavaScript
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Prevent cross-site request forgery (CSRF)
  });

  // Step 2: Add any additional cleanup tasks here (if required)
  // For example, invalidating the token on the server-side or logging user activity

  // Step 3: Redirect the user to the home page (or login page)
  // This ensures the user is redirected to a safe landing page after logging out
  return res.redirect("/");
});

// #important
router.get("/GetProjectPage", async (req, res) => {
  const workerID = req.user.id; // Get the worker's ID from the logged-in user
  const user = await User.findById(workerID);
  try {
    // Fetch all projects and populate the postedBy field to get the user's full name
    let projects = await Project.find({}).populate("postedBy", "fullName");

    // Filter out projects where the worker has already made a bid (workerID is in bidsMade)
    projects = projects.filter((project) => {
      return !project.bidsMade.includes(workerID);
    });

    // Filter out projects where the number of bids exceeds the limit (5 bids)
    projects = projects.filter((project) => {
      return project.bidsMade.length < 5;
    });

    // You can reduce the projects array or apply any other business logic here
    // Example: Reducing projects if some condition is met or applying pagination
    // projects = reduceArray(projects);

    // Render the template with the filtered projects

    console.log(projects);
    return res.render("Dash/workerDash/getProject.ejs", {
      user,
      projects, // Pass the filtered projects to the EJS template
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in /GetProjectPage handler:", error);

    // Render an error page if something went wrong
    return res.status(500).render("error.ejs", {
      message:
        "An unexpected error occurred while fetching projects. Please try again later.",
    });
  }
});

router.get("/LookProject/:project_id", async (req, res) => {
  const { project_id } = req.params; // Destructure the project_id correctly
  try {
    const project = await Project.findById(project_id).populate(
      "postedBy",
      "fullName"
    ); // Fetch the project by ID
    if (!project) {
      return res.status(404).send("Project not found"); // Handle case when project is not found
    }
    return res.render("WorkerDash/LookProject", { project }); // Render the project page with the project data
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).send("Server error"); // Handle errors
  }
});

// #important
router.get("/MakeBid/:projectID/:expiresAt", async (req, res) => {
  const workerID = req.user.id; // Get the worker's ID from the logged-in user
  const { projectID, expiresAt } = req.params;
  console.log(expiresAt);
  const user = await User.findById(workerID);

  return res.render("Dash/workerDash/makeBid.ejs", {
    user,
    projectID,
    expiresAt,
  });
});

// #important
router.post("/MakeBid/:projectID/:expiresAt", async (req, res) => {
  try {
    // Log to ensure the endpoint is being hit correctly
    console.log("Received bid submission. Everything is working correctly.");

    // Extract the projectID from the route parameters
    const { projectID, expiresAt } = req.params;
    // console.log(expiresAt);
    // Extract bid-related data from the request body
    const { amount, description, deadline } = req.body;

    // Check if any of the required fields are missing (amount, description, or deadline)
    if (!amount || !description || !deadline) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Assuming the user is authenticated, the worker's ID is available in req.user._id
    const workerID = req.user.id;

    const worker = await User.findById(workerID);
    if (!worker.profile.snapID || !worker.profile.instaID) {
      return res.status(400).json({
        success: false,
        message: `Hey ${worker.fullName} pls compelete your profile details that client might rreach you through`,
      });
    }

    // Find the project by its ID
    const project = await Project.findById(projectID);

    // Check if the project exists
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if the worker has already made a bid for this project
    if (project.bidsMade && project.bidsMade.includes(workerID)) {
      return res.status(400).json({
        success: false,
        message: "You have already made a bid for this project.",
      });
    }

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

    // Log the created bid for debugging purposes
    // console.log("New bid created:", bid);

    // Return a success response
    return res.status(201).json({
      success: true,
      message: "Bid successfully submitted!",
      bid: bid, // Include the newly created bid details in the response
      projectID: projectID, // Return the project ID so the client knows which project the bid was for
      workerID: workerID, // Return the worker's ID as well
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating bid:", error);
    console.log(error.message);

    // Return a 500 server error response if something goes wrong
    return res.status(500).json({
      success: false,
      message: `An error occurred while submitting the bid. Please try again later. ${error.message}`,
      error: error.message,
    });
  }
});

// worker's offers
router.get("/OfferPage", (req, res) => {
  return res.render("WorkerDash/YourOffer.ejs");
});

router.post("/OfferPage", async (req, res) => {
  try {
    const worker = req.user.id; // Assuming you're using a JWT-based system and have user info in req.user
    if (!worker) {
      return res
        .status(400)
        .json({ success: false, message: "Worker not found" });
    }

    // Find bids by the worker that have a project with a non-null/valid value
    let offers = await Bid.find({ worker })
      .populate("project", "assignment_title description value") // Include value of the project in populate
      .populate("worker", "name email") // Populating only necessary fields from the User model (worker)
      .exec();
    console.log(offers);

    if (!offers || offers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No offers found with valid project value for this worker",
      });
    }

    // Respond with the worker's offers
    console.log(offers);

    return res.status(200).json({ success: true, offers });
  } catch (err) {
    console.error("Error fetching worker offers:", err);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
});

export const workerRoute = router;
