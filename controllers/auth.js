import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import { WelcomeEmail, sendVerificationEmail } from "../mailer/mailer.js";
import {
  generateTokenAndSetCookie,
  generateTokenAndSetCookieProfile,
} from "../utils/createJwtTokenSetCookie.js";
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
    let { userName, email, password, role, college } = req.body;

    // Check if a user with the provided email already exists
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).json({ errors: ["Email is already in use"] });
    }
    // Check if a user with the provided userName already exists
    const existingUserWithuserName = await User.findOne({ userName });
    if (existingUserWithuserName) {
      return res.status(400).json({ errors: ["userName is already in use"] });
    }

    // Generate a numeric verification code (e.g., 6 digits)
    const verificationCode = generateNumericCode(6);

    // Create a new user instance with the provided details
    password = await bcrypt.hash(password, 10);
    const newUser = new User({
      collegeName: college,
      userName,
      email,
      password, // Note: Always hash passwords before saving them
      role, // e.g., "user", "admin", etc.
      verifiedEmailToken: verificationCode,
      verifiedEmailTokenExpiry: Date.now() + 3 * 24 * 60 * 60 * 1000,
    });

    // Save the new user to the database
    await newUser.save();

    // Generate the verification link
    const verificationLink = `https://assocom.onrender.com/home/verifyEmail/${verificationCode}`;
    // const verificationLink = `https://localhost:3000/home/verifyEmail/${verificationCode}`;

    sendVerificationEmail({ verificationLink, newUser });

    // Send a welcome email
    // WelcomeEmail(newUser);

    // Return a success response to the client
    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your email righit way otherwise you would not be able to loggedin",
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
    // Create a new user instance
    const newUser = new User({
      userName: username,
      githubId: id,
      email,
      "profile.profilePicture": profileImage, // Correctly set the nested field,
      isEmailVerified: true,
    });

    await newUser.save();

    // let's add some more function here
    // Encrypt the user ID
    generateTokenAndSetCookieProfile(res, newUser._id);
    const encryptedID = encrypt(newUser._id.toString());
    return res.redirect(`/home/fillRole/${encryptedID}`);
  } catch (error) {
    console.log(error.message);
    return res.render("auth/signup.ejs", {
      ErrorMessage: `An unexpected error occurred while creating the user account. Please try again later ${error.message}`,
    });
  }
};
export const GoogleSignup = async (req, res) => {
  try {
    // Destructure necessary fields from req.user
    const { id, username, email, imageUrl } = req.user || {}; // Default to empty object if req.user is undefined

    // Check if the necessary fields are available
    if (!id || !username || !email) {
      return res.render("auth/signup.ejs", {
        ErrorMessage:
          "Required information is missing from the Google profile. Please try again.",
      });
    }

    // Handle profile image URL if available
    const profileImage = imageUrl || null; // If no profileImage URL, set to null

    // Create a new user instance
    const newUser = new User({
      userName: username,
      googleId: id,
      email,
      "profile.profilePicture": profileImage, // Set the profile picture
      isEmailVerified: true, // Assuming the email is verified with Google
    });

    // Save the new user to the database
    await newUser.save();

    // Encrypt the user ID and generate a token to set cookies
    generateTokenAndSetCookieProfile(res, newUser._id);

    const encryptedID = encrypt(newUser._id.toString());

    // Redirect the user to a profile setup page using the encrypted ID
    return res.redirect(`/home/fillRole/${encryptedID}`);
  } catch (error) {
    // Handle unexpected errors
    console.error(error); // Log the error for debugging purposes
    return res.render("auth/signup.ejs", {
      ErrorMessage:
        "An unexpected error occurred while creating the user account. Please try again later.",
    });
  }
};
export const FacebookSignup = async (req, res) => {
  try {
    // Destructure necessary fields from req.user (Facebook data)
    const { id, displayName, imageUrl } = req.user || {}; // Default to empty object if req.user is undefined

    // Check if the necessary fields are available
    if (!id || !displayName) {
      return res.render("auth/signup.ejs", {
        ErrorMessage:
          "Required information is missing from the Facebook profile. Please try again.",
      });
    }

    // Handle profile image URL if available
    const profileImage = imageUrl || null; // If no profileImage URL, set to null

    // Check if the user already exists by Facebook ID
    const existingUser = await User.findOne({ facebookId: id });
    if (existingUser) {
      return res.render("auth/signup.ejs", {
        ErrorMessage:
          "This Facebook account is already associated with an existing account. Please try signing in instead.",
      });
    }

    // Create a new user instance without email
    const newUser = new User({
      userName: displayName, // Use displayName for username
      facebookId: id, // Use Facebook ID to identify the user
      "profile.profilePicture": profileImage, // Set the profile picture
    });

    // Save the new user to the database
    await newUser.save();

    // Encrypt the user ID and generate a token to set cookies
    generateTokenAndSetCookieProfile(res, newUser._id);

    const encryptedID = encrypt(newUser._id.toString());

    // Redirect the user to a profile setup page using the encrypted ID
    return res.redirect(`/home/fillRole/${encryptedID}`);
  } catch (error) {
    // Handle unexpected errors
    console.error(error); // Log the error for debugging purposes
    return res.render("auth/signup.ejs", {
      ErrorMessage:
        "An unexpected error occurred while creating the user account. Please try again later.",
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
    if (user.githubId) {
      return res.status(400).json({
        errors: [
          "Pls Go to signup Page and click on Sign up With Github You will logged into your dashboard",
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

    if (!user.isEmailVerified) {
      const leftTime = user.verifiedEmailTokenExpiry - Date.now();

      if (leftTime > 0) {
        const days = Math.floor(leftTime / (1000 * 60 * 60 * 24)); // Convert to days
        const hours = Math.floor(
          (leftTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ); // Remaining hours
        const minutes = Math.floor((leftTime % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes

        return res.status(400).json({
          errors: [
            `Your email is not verified. An email was sent when you signed up. You have ${days} days, ${hours} hours, and ${minutes} minutes left to verify your email.`,
          ],
        });
      } else {
        return res.status(400).json({
          errors: [
            "Your email verification link has expired. Your existing credentials will be deleted soon. You have to sign up again.",
          ],
        });
      }
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
    console.log(error.message);
    return res.status(500).json({
      errors: [
        `An internal server error occurred: ${error.message}. Please contact support if the issue persists.`,
      ],
    });
  }
};

export const GithubSignin = async (req, res) => {};
