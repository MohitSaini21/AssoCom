import jwt from "jsonwebtoken"; // Importing the JWT library to handle JSON Web Token operations

// Middleware function to check if the user is authenticated and prevent access to the home page if logged in
export const checkAuthHome = (req, res, next) => {
  try {
    // Step 1: Get the authentication token from the cookies sent by the client
    const token = req.cookies.authToken;

    // Step 2: If the token is found, verify it
    if (token) {
      // Verify the token using the secret key stored in environment variables

      console.log("user is being redirected to the dashbaord.");
      // Only redirect to /userDashboard if the user is not already on the dashboard
      if (req.path !== "/userDashboard") {
        return res.redirect("/userDashboard"); // Redirect to user dashboard if the user is already authenticated
      }
    }

    // Step 4: If no token is found, allow the request to proceed to the home page or login/signup pages
    next();
  } catch (error) {
    // Step 5: If an error occurs during token verification (e.g., invalid or expired token), allow the request to proceed
    console.error("Authentication error:", error); // Log the error for debugging

    // Step 6: If the error is related to JWT (invalid or expired token), continue to the next middleware
    if (error instanceof jwt.JsonWebTokenError) {
      return next(); // Allow the request to proceed even if the token is invalid
    } else {
      // Step 7: If the error is not related to JWT (e.g., server error), continue to the next middleware
      return next(); // Allow the request to proceed in case of other errors
    }
  }
};
