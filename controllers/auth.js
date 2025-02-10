import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import { WelcomeEmail } from "../mailer/mailer.js";
import {
  generateTokenAndSetCookie,
  generateTokenAndSetCookieProfile,
} from "../utils/createJwtTokenSetCookie.js";
import { encrypt } from "../utils/Crypto.js";

export const GithubSignup = async (req, res) => {
  const { id, username, email, photos } = req.user; // Destructure `photos` from req.user
  const profileImage = photos && photos.length > 0 ? photos[0].value : null; // Extract profile image URL

  try {
    const newUser = new User({
      userName: username,
      githubId: id,
      email,
      "profile.profilePicture": profileImage, // Correctly set the nested field,
      isEmailVerified: true,
    });

    await newUser.save();
    WelcomeEmail(newUser);

    generateTokenAndSetCookieProfile(res, newUser._id);
    const encryptedID = encrypt(newUser._id.toString());
    return res.redirect(`/home/fillRole/${encryptedID}`);
  } catch (error) {
    return res.render("auth/signup.ejs", {
      ErrorMessage: `Server Error`,
    });
  }
};
export const GoogleSignup = async (req, res) => {
  try {
    // Destructure necessary fields from req.user
    const { id, username, email, imageUrl, displayName } = req.user || {}; // Default to empty object if req.user is undefined

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
      userName: displayName,
      googleId: id,
      email,
      "profile.profilePicture": profileImage, // Set the profile picture
      isEmailVerified: true, // Assuming the email is verified with Google
    });

    // Save the new user to the database
    await newUser.save();
    WelcomeEmail(newUser);

    // Encrypt the user ID and generate a token to set cookies
    generateTokenAndSetCookieProfile(res, newUser._id);

    const encryptedID = encrypt(newUser._id.toString());

    // Redirect the user to a profile setup page using the encrypted ID
    return res.redirect(`/home/fillRole/${encryptedID}`);
  } catch (error) {
    // Handle unexpected errors
    console.error(error); // Log the error for debugging purposes
    return res.render("auth/signup.ejs", {
      ErrorMessage: "Server Error",
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

export const GithubSignin = async (req, res) => {};
