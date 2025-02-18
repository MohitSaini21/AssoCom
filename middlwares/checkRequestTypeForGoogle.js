import User from "../models/userSchema.js";
import { encrypt } from "../utils/Crypto.js";
import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";
import { generateTokenAndSetCookieProfile } from "../utils/createJwtTokenSetCookie.js";

export const CheckRequestTypeForGoogle = async (req, res, next) => {
  try {
    const { id: googleId } = req.user;

    // Check if the user exists in the database by googleId
    const user = await User.findOne({ googleId });

    if (!user) {
      // If user does not exist, proceed to the next middleware (could be sign-up)
      return next();
    }

    // Check if user has a role
    if (!user.role) {
      // If user doesn't have a role, redirect to the role-filling page
      generateTokenAndSetCookieProfile(res, user._id);
      const encryptedID = encrypt(user._id.toString());
      return res.redirect(`/home/fillRole/${encryptedID}`);
    }

    // If user exists and has a role, generate token and set cookie
    const token = generateTokenAndSetCookie(res, user._id, user.role);
    if (token) {
      return res.render("auth/load.ejs", { user });
    }

    // If no conditions matched, continue to the next middleware
    next();
  } catch (error) {
    console.error("Error checking Google user:", error);
    return res.render("auth/signup.ejs", {
      ErrorMessage:
        "An internal server error occurred while processing the Google sign-in.",
    });
  }
};
