import express from "express";
import User from "../models/userSchema.js";
import Project from "../models/projectSchema.js";
import Bid from "../models/offerSchema.js";
import rateLimit from "express-rate-limit";
import { ValidatorProject } from "../middlwares/projectValidate.js";
import { filterBody } from "../middlwares/filter.js";
import { generateWorkerMessage } from "../utils/GenereteMesg.js";
import { sendNotificationToWorker } from "../utils/notify.js";
import Message from "../models/mesg.js";
const router = express.Router();
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  max: 2, // Maximum submissions allowed
  message:
    "You can only post a project 2 times every 1 day. Please try again later.", // Custom message for rate-limited users
  keyGenerator: (req) => req.user.id || req.ip, // Use user ID or IP as the key
  standardHeaders: true, // Include rate-limit information in the response headers
  legacyHeaders: false, // Disable the legacy rate-limit headers

  // This function is executed whenever a user exceeds the rate limit
  handler: (req, res) => {
    const remainingTime = req.rateLimit.resetTime - Date.now(); // Time until the limit resets
    res.status(429).json({
      message:
        "You can only post a project 2 times every 1 day. Please try again later.", // Updated message for rate-limited users
      remainingTime: remainingTime, // Time remaining until reset in ms
      resetAt: new Date(req.rateLimit.resetTime).toISOString(), // When the limit will reset
    });
  },
});

// #Important
router.get("/postProject", async (req, res) => {
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

  return res.render("Dash/clientDash/postProject.ejs", { user });
});

router.get("/projects", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const projects = await Project.find({ postedBy: req.user.id });
    return res.render("Dash/clientDash/projects.ejs", { user, projects });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

// #Important
router.post(
  "/postProject",
  ValidatorProject,
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
        bidsMade: [], // Explicitly initialize as an empty array
        expiresAt: Date.now() + 60 * 60 * 1000, // Set expiration time to 1 minute from now
      };

      // Create the project in the database
      const project = await Project.create(projectData);

      if (!project) {
        throw new Error("Server Error");
      }

      // Return a success response with the created project data
      return res.status(201).json({
        message: "Project submitted successfully.",
      });
    } catch (error) {
      // Return a 500 Internal Server Error response
      return res.status(500).json({
        message:
          "An unexpected error occurred while submitting the projec. Please try again later.",
      });
    }
  }
);

// // Client 's Project rendering
// router.get("/YourProject", async (req, res) => {
//   try {
//     // Ensure the session user is authenticated
//     const postedBy = req.user.id; // This refers to the ID of the logged-in user
//     if (!postedBy) {
//       return res.redirect("/login"); // Redirect to login page if the user is not authenticated
//     }

//     // Use 'find' to fetch all projects posted by the current user
//     const projects = await Project.find({ postedBy }).lean(); // Use .lean() for better performance
//     // console.log(projects);

//     // If no projects are found, you can send a response or render a different view
//     if (!projects || projects.length === 0) {
//       return res.render("ClientDash/YourProject", {
//         message: "You haven't posted any projects yet.",
//         projects,
//       });
//       // return res.send("No Project")
//     }

//     // Render the page with the projects
//     return res.render("ClientDash/YourProject", { projects });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Internal Server Error");
//   }
// });

// Client offers route
router.get("/Offer", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postedBy = req.user.id; // Get the logged-in user's ID
    // Fetch projects posted by the client
    const projects = await Project.find({ postedBy }).populate(
      "postedBy",
      "userName"
    ); // Populate the postedBy field with the user's info

    // Fetch offers (bids) for each project
    // const offers = await Promise.all(
    //   projects.map(async (project) => {
    //     const projectBids = await Bid.find({ project: project._id })
    //       .populate("worker", "userName profile") // Specify nested fields
    //       .exec();
    //     return { project, bids: projectBids }; // Return both project and its associated bids
    //   })
    // );

    // new
    // Fetch offers (bids) for each project
    const offers = await Promise.all(
      projects.map(async (project) => {
        const projectBids = await Bid.find({ project: project._id })
          .populate("worker", "userName profile") // Specify nested fields
          .exec();

        // Filter out the rejected bids here
        const validBids = projectBids.filter(
          (bid) => bid.status !== "rejected"
        );

        // Count the pending bids
        const pendingBidsCount = validBids.filter(
          (bid) => bid.status === "pending"
        ).length;

        return {
          project,
          bids: validBids, // Only include non-rejected bids here
          pendingBidsCount,
        };
      })
    );

    // Now filter projects with at least one valid bid
    const projectsWithBids = offers.filter((offer) => offer.bids.length > 0);

    // Pass the filtered projects and their associated offers to the EJS template

    // console.log(projectsWithBids[0].bids);

    console.log(projectsWithBids);
    return res.render("Dash/clientDash/offers.ejs", {
      user,
      offers: projectsWithBids,
    });
  } catch (error) {
    return res.redirect("/CWS");
  }
});
router.get("/FilteredOffer", async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Get logged-in user
    const postedBy = req.user.id; // Get the logged-in user's ID

    // Fetch projects posted by the client
    const projects = await Project.find({ postedBy }).populate(
      "postedBy",
      "userName"
    );

    // Fetch offers (bids) for each project
    const offers = await Promise.all(
      projects.map(async (project) => {
        const projectBids = await Bid.find({ project: project._id })
          .populate("worker", "userName collegeName profile") // Populate worker's profile
          .exec();

        // Filter out the rejected bids and only include valid bids from the user's college
        const validBids = projectBids.filter(
          (bid) =>
            bid.status !== "rejected" &&
            bid.worker.collegeName === user.collegeName
        );

        // Count the pending bids for the user
        const pendingBidsCount = validBids.filter(
          (bid) => bid.status === "pending"
        ).length;

        return {
          project,
          bids: validBids, // Only include non-rejected and college-matched bids
          pendingBidsCount,
        };
      })
    );

    // Filter projects with at least one valid bid
    const projectsWithBids = offers.filter((offer) => offer.bids.length > 0);

    console.log(projectsWithBids);

    return res.render("Dash/clientDash/offers.ejs", {
      user,
      offers: projectsWithBids,
    });
  } catch (error) {
    return res.redirect("/CWS");
  }
});

// router.get("/projectDetail/:projectID", async (req, res) => {
//   try {
//     // Extract the projectID from request parameters
//     const { projectID } = req.params;

//     // Check if the projectID is provided in the URL params
//     if (!projectID) {
//       // If projectID is missing, throw an error with a descriptive message
//       return res.status(400).json({
//         success: false,
//         message:
//           "Project ID is required and must be provided in the request URL.",
//       });
//     }

//     // Attempt to retrieve the project from the database using the projectID
//     const project = await Project.findById(projectID);

//     // Check if the project was found in the database
//     if (!project) {
//       // If project is not found, return a not found response
//       return res.status(404).json({
//         success: false,
//         message: `No project found with ID: ${projectID}. Please verify the ID and try again.`,
//       });
//     }

//     return res.render("ClientDash/ViewProject.ejs", { project });
//   } catch (error) {
//     // General error handler for server-side issues (e.g., database failure, invalid ID format)
//     console.error("Error in /projectDetail route:", error);

//     // Return a server error response
//     return res.status(500).json({
//       success: false,
//       message: `An internal server error occurred. Please try again later. Error details: ${error.message}`,
//     });
//   }
// });

// router.get("/editProject/:projectID", async (req, res) => {
//   try {
//     // Extract the projectID from request parameters
//     const { projectID } = req.params;

//     // Check if the projectID is provided in the URL params
//     if (!projectID) {
//       // If projectID is missing, throw an error with a descriptive message
//       return res.status(400).json({
//         success: false,
//         message:
//           "Project ID is required and must be provided in the request URL.",
//       });
//     }

//     // Attempt to retrieve the project from the database using the projectID
//     const project = await Project.findById(projectID);

//     return res.render("ClientDash/editProject.ejs", { project });
//   } catch (error) {
//     // General error handler for server-side issues (e.g., database failure, invalid ID format)
//     console.error("Error in /projectDetail route:", error);

//     // Return a server error response
//     return res.status(500).json({
//       success: false,
//       message: `An internal server error occurred. Please try again later. Error details: ${error.message}`,
//     });
//   }
// });
// // import Project from "../models/Project"; // Import the Project model

// router.post("/editProject/:projectID", async (req, res) => {
//   const { projectID } = req.params; // Get the project ID from the URL
//   const {
//     student_name,
//     course_name,
//     course_code,
//     semester,
//     assignment_title,
//     assignment_type,
//     description,
//     skills_required,
//     deadline,
//     budget,
//     preferred_language,
//     payment_method,
//     is_urgent,
//   } = req.body; // Get the data from the form

//   try {
//     // Find the project by ID and update it with the new data
//     const updatedProject = await Project.findByIdAndUpdate(
//       projectID, // The project ID to find
//       {
//         student_name,
//         course_name,
//         course_code,
//         semester,
//         assignment_title,
//         assignment_type,
//         description,
//         skills_required,
//         deadline,
//         budget,
//         preferred_language,
//         payment_method,
//         is_urgent,
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // Send the updated project as a response
//     return res.redirect(`/client/YourProject`);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project", error });
//   }
// });

// There is error in updatin the status
router.post("/bidStatus/:bidID/:projectID", async (req, res) => {
  try {
    const { bidID, projectID } = req.params;
    const { status } = req.body;

    console.log(bidID, projectID);
    console.log(status);

    // Validate status value
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the bid by ID and update the status
    const bid = await Bid.findByIdAndUpdate(
      bidID,
      { status }, // Update the status field
      { new: true } // Return the updated bid
    );
    const worker = await User.findById(bid.worker);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // If the status is "rejected", remove the worker's ID from the project's bidsMade array
    const project = await Project.findById(projectID);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const client = await User.findById(project.postedBy);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    if (status === "rejected") {
      const workerID = bid.worker.toString(); // Assuming bid has a worker field

      // Remove the worker's ID from bidsMade array if rejected
      project.bidsMade = project.bidsMade.filter(
        (worker) => worker.toString() !== workerID
      );

      await project.save();
    }
    const message = generateWorkerMessage(worker, client, project, status);
    if (worker.Ntoken) {
      sendNotificationToWorker(worker.Ntoken, message);
    }
    const newMessage = await Message.create({
      userId: worker._id,
      messageContent: message,
      expiresAt: project.expiresAt,
    });
    if (!newMessage) {
      console.log("mesg has been saved");
    }

    return res
      .status(200)
      .json({ success: true, message: "Bid status updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      errorDetails: error.message,
    });
  }
});

router.get("/workerProfile/:workerID", async (req, res) => {
  const { workerID } = req.params;
  const worker = await User.findById(workerID);
  const user = await User.findById(req.user.id);
  const currentTime = new Date().toLocaleString(); // Get current time in a readable format

  const message = `Hello ${worker.userName}, your profile has been visited by a ${user.userName}. They may reach out to you soon, so be ready to seize the opportunity! The visit was logged at ${currentTime}.`;

  if (worker.Ntoken) {
    sendNotificationToWorker(worker.Ntoken, message);
  }
  const newMessage = await Message.create({
    userId: worker._id,
    messageContent: message,
  });
  if (!newMessage) {
    console.log("mesg has been saved");
  }

  return res.render("Dash/clientDash/workerProfile.ejs", { worker, user });
});

// ==========================================
// Export the clientRoute router to be used in the main server file
export const clientRoute = router;
