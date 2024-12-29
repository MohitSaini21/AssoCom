import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import { WelcomeEmail, sendVerificationEmail } from "../mailer/mailer.js";
import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";
import { encrypt } from "../utils/Crypto.js";
function generateNumericCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10); // Append random digit (0-9)
  }
  return code;
}

export const signupHandler = async (req, res) => {
  try {
    // Extract and validate input from the request body
    let { fullName, email, password, role } = req.body;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: ["Email is already in use"] });
    }

    // Generate a numeric verification code (e.g., 6 digits)
    const verificationCode = generateNumericCode(6);

    // Create a new user instance with the provided details
    password = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      password, // Note: Always hash passwords before saving them
      role, // e.g., "user", "admin", etc.
      verifiedEmailToken: verificationCode,
      verifiedEmailTokenExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    });

    // Save the new user to the database
    await newUser.save();

    // Generate the verification link
    // const verificationLink = `http://192.168.59.70:3000/verifyEmail/${verificationCode}`;

    //Email Regarding work has been put off for temproray tenure.
    // Send a verification email with the link
    // sendVerificationEmail({verificationLink, newUser});

    // Send a welcome email
    // WelcomeEmail(newUser);

    // Return a success response to the client
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    // Handle unexpected server errors
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

export const GithubSignup = async (req, res) => {
  const { id, username, email, photos } = req.user; // Destructure `photos` from req.user
  const profileImage = photos && photos.length > 0 ? photos[0].value : null; // Extract profile image URL

  try {
    // Check if the user already exists by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("error.ejs", {
        title: "Email Already in Use",
        errorMessage:
          "The email address you provided is already associated with an account. Please try signing in instead.",
        errorCode: 400,
        errorType: "Client Error",
      });
    }

    // Check if the user already exists by GitHub ID
    const existingID = await User.findOne({ githubId: id });
    if (existingID) {
      return res.status(400).render("error.ejs", {
        title: "GitHub ID Already in Use",
        errorMessage:
          "The GitHub account you are trying to use is already linked to an existing account.",
        errorCode: 400,
        errorType: "Client Error",
      });
    }

    // Create a new user instance
    const newUser = new User({
      fullName: username,
      githubId: id,
      email,
      "profile.profilePicture": profileImage, // Correctly set the nested field
    });

    // Save the new user to the database
    await newUser.save();

    // Redirect to the sign-in page with a success message

    // Sending Welcome Email has been put off for temproray purpose
    // WelcomeEmail(newUser);
    return res.status(201).redirect("/signin");
  } catch (error) {
    console.error("Error during GitHub signup:", error);

    // Render the error.ejs template with error details
    return res.status(500).render("error.ejs", {
      title: "Server Error",
      errorMessage:
        "An unexpected error occurred while creating the user account. Please try again later.",
      errorCode: 500,
      errorType: "Server Error",
    });
  }
};

export const SiginHandler = async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Step 1: Find the user in the database using the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        errors: [
          "The provided email is not registered in our database. Please check and try again.",
        ],
      });
    }

    // Step 2: Validate the provided password against the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        errors: ["The password you entered is incorrect. Please try again."],
      });
    }
    // Step 3: Check if the user has a role
    if (!user.role) {
      // Encrypt the user ID
      const encryptedID = encrypt(user._id.toString());
      return res.status(307).json({
        success: false,
        redirect: `/home/fillRole/${encryptedID}`, // URL where the user should be redirected
        message: "Please complete your profile by filling out your role.",
      });
    }

    // Step 3: Generate a token and set it as a cookie
    const token = generateTokenAndSetCookie(res, user._id, user.role);
    if (!token) {
      throw new Error(
        "An error occurred while generating the authentication token. Please try again later."
      );
    }

    // Step 4: Respond with a success message
    return res.status(200).json({
      success: true,
      message:
        "Login successful! Please verify your email to complete the process.",
    });
  } catch (error) {
    // Step 5: Handle unexpected errors and send a descriptive response
    return res.status(500).json({
      errors: [
        `An internal server error occurred: ${error.message}. Please contact support if the issue persists.`,
      ],
    });
  }
};

export const GithubSignin = async (req, res) => {};
