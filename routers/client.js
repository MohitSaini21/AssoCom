import express from "express";
import User from "../models/userSchema.js";
import Project from "../models/projectSchema.js";
import Bid from "../models/offerSchema.js";

const router = express.Router();

// Route to handle the client dashboard home page
router.get("/", async (req, res) => {
  // Retrieve the user information using the user ID from the request object
  const user = await User.findById(req.user.id);

  // Render the home page for the client dashboard, passing the user data
  return res.render("ClientDash/home", { user }); // Reference the file inside the ClientDash folder
});

// Route to handle the client profile page
router.get("/profile", async (req, res) => {
  // Retrieve the user information using the user ID from the request object
  const user = await User.findById(req.user.id);

  // Render the profile page for the client dashboard, passing the user data
  return res.render("ClientDash/profile", { user }); // Reference the file inside the ClientDash folder
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

router.get("/postProject", (req, res) => {
  return res.render("ClientDash/PostProject.ejs");
});

router.post("/postProject", async (req, res) => {
  try {
    // Destructure incoming data from the request body
    const {
      student_name,
      course_name,
      course_code,
      semester,
      assignment_title,
      assignment_type,
      description,
      skills_required,
      deadline,
      budget,
      preferred_language,
      payment_method,
      is_urgent,
    } = req.body;

    // Validate required fields
    if (
      !student_name ||
      !course_name ||
      !course_code ||
      !semester ||
      !assignment_title ||
      !description ||
      !skills_required ||
      !deadline ||
      !payment_method
    ) {
      return res.status(400).json({
        error:
          "All required fields must be provided. Please check and submit again.",
      });
    }

    // Create project object with the validated data
    const projectData = {
      student_name,
      course_name,
      course_code,
      semester,
      assignment_title,
      assignment_type,
      description,
      skills_required,
      deadline,
      budget: budget || 0, // Default budget to 0 if not provided
      preferred_language,
      payment_method,
      is_urgent: is_urgent || false, // Default is_urgent to false if not provided
      postedBy: req.user ? req.user.id : "anonymous", // Use user id from middleware or "anonymous",
      bidsMade: [],  // Explicitly initialize as an empty array
      expiresAt: Date.now() + 10 * 60 * 1000, // Set expiration time to 1 minute from now
    };

    // Create the project in the database
    const project = await Project.create(projectData);

    if (!project) {
      throw new Error("Server Error");
    }

    // Return a success response with the created project data
    return res.status(201).json({
      message: "Project submitted successfully.",
      project: project, // Send the created project object back to the client
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in /postProject handler:", error);

    // Return a 500 Internal Server Error response
    return res.status(500).json({
      error:
        "An unexpected error occurred while submitting the project. Please try again later.",
    });
  }
});

// Client 's Project rendering
router.get("/YourProject", async (req, res) => {
  try {
    // Ensure the session user is authenticated
    const postedBy = req.user.id; // This refers to the ID of the logged-in user
    if (!postedBy) {
      return res.redirect("/login"); // Redirect to login page if the user is not authenticated
    }

    // Use 'find' to fetch all projects posted by the current user
    const projects = await Project.find({ postedBy }).lean(); // Use .lean() for better performance
    // console.log(projects);

    // If no projects are found, you can send a response or render a different view
    if (!projects || projects.length === 0) {
      return res.render("ClientDash/YourProject", {
        message: "You haven't posted any projects yet.",
        projects,
      });
      // return res.send("No Project")
    }

    // Render the page with the projects
    return res.render("ClientDash/YourProject", { projects });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

// Client offers route
router.get("/Offer", async (req, res) => {
  try {
    const postedBy = req.user.id; // Get the logged-in user's ID
    // Fetch projects posted by the client
    const projects = await Project.find({ postedBy }).populate(
      "postedBy",
      "fullName"
    ); // Populate the postedBy field with the user's info

    // Fetch offers (bids) for each project
    const offers = await Promise.all(
      projects.map(async (project) => {
        const projectBids = await Bid.find({ project: project._id })
          .populate("worker", "fullName") // Populate the worker's info (username in this case)
          .exec();
        return { project, bids: projectBids }; // Return both project and its associated bids
      })
    );

    // Filter to only include projects with at least one bid
    const projectsWithBids = offers.filter((offer) => offer.bids.length > 0);
    console.log(projectsWithBids)

    // Pass the filtered projects and their associated offers to the EJS template
    return res.render("ClientDash/Offer.ejs", { offers: projectsWithBids });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
});

// ==========================================
// Export the clientRoute router to be used in the main server file
export const clientRoute = router;
