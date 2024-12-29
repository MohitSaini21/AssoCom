import jwt from "jsonwebtoken"; // Importing the JWT library to handle JSON Web Token operations

// Middleware function to check if the user is authenticated and prevent access to the home page if logged in
export const checkAuthDash = (req, res, next) => {
    console.log("hii there how are you")
  try {
    // Step 1: Get the authentication token from the cookies sent by the client
    const token = req.cookies.authToken;
    console.log(token);
    console.log("first Check");
    // Step 2: If the token is found, verify it
    if (token) {
        // Verify the token using the secret key stored in environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("SecondCheck");

      // Step 3: If the token is valid, print the payload (user data) and attach it to the request object
      console.log("Decoded Payload:", decoded); // Printing the payload to the console (for debugging)
      req.user = decoded; // Attach the decoded user data to the request object

      // Step 4: Proceed to the next middleware or route handler
      return next();
    }

    // Step 5: If no token is found, allow the request to proceed to the home page or login/signup pages
    return res.redirect("/"); // Redirect to home page in case of any error
  } catch (error) {
    // Step 6: If an error occurs during token verification (e.g., invalid or expired token), handle it
    console.error("Authentication error:", error); // Log the error for debugging

    // Step 7: Redirect to the home page if any error occurs
    return res.redirect("/"); // Redirect to home page in case of any error
  }
};
