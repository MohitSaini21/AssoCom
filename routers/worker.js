import express from "express";
import User from "../models/userSchema.js";
import Project from "../models/projectSchema.js";
import Bid from "../models/offerSchema.js";
const router = express.Router();
// Get Request page renderere

function reduceArray(arr) {
  // Calculate the target size (half of the original array length)
  const targetSize = Math.floor(arr.length / 2);

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

router.get("/GetProjectPage", async (req, res) => {
  try {
    // Simulate fetching projects from a database (replace with actual DB query)
    let projects = await Project.find({}).populate("postedBy", "fullName");
    // const originalArray = [1, 2, 3, 4, 5, 6, 7, 8];

    // console.log(reducedArray);
    projects = reduceArray(projects);

    // Render the EJS template with the fetched projects
    return res.render("WorkerDash/GetProjects.ejs", {
      projects, // Pass the projects array to the template
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in /GetProjectPage handler:", error);

    // Render an error page or return an error response
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

// Handling a Bid
router.get("/MakeBid/:projectID", (req, res) => {
  const { projectID } = req.params;

  return res.render("WorkerDash/BidForm.ejs", { projectID });
});
// Define the route for creating a new bid
router.post("/MakeBid/:projectID", async (req, res) => {
  try {
    // Log to ensure the endpoint is being hit correctly
    console.log("Received bid submission. Everything is working correctly.");

    // Extract the projectID from the route parameters
    const { projectID } = req.params;

    // Extract bid-related data from the request body
    const { amount, description, deadline } = req.body;

    // Check if any of the required fields are missing (amount, description, or deadline)
    if (!amount || !description || !deadline) {
      // Return an error response if required fields are not provided
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Assuming the user is authenticated, the worker's ID is available in req.user._id
    const workerID = req.user.id;

    // Create a new bid using the Bid model (this will save it to the database)
    const bid = await Bid.create({
      amount, // The amount the worker is bidding
      description, // A description of the bid or the worker's approach
      deadline, // The deadline the worker can meet for the project
      project: projectID, // The ID of the project the worker is bidding for
      worker: workerID, // The ID of the worker making the bid
    });

    // Log the created bid for debugging purposes
    // console.log("New bid created:", bid);

    // If the bid is successfully created, return a success response
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

    // Return a 500 server error response if something goes wrong
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting the bid. Please try again later.",
      error: error.message,
    });
  }
});

export const workerRoute = router;
