import User from "../models/userSchema.js";
import { encrypt } from "../utils/Crypto.js";
import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";
import { generateTokenAndSetCookieProfile } from "../utils/createJwtTokenSetCookie.js";

export const CheckRequestType = async (req, res, next) => {
  try {
    const { id: githubId } = req.user;

    // Check if the user exists in the database
    const user = await User.findOne({ githubId });

    if (!user) {
      // If user does not exist, call the next middleware
      return next();
    }

    if (!user.role) {
      generateTokenAndSetCookieProfile(res, user._id);
      const encryptedID = encrypt(user._id.toString());
      return res.redirect(`/home/fillRole/${encryptedID}`);
    }

    // If user exists and has a role, generate token and redirect
    const token = generateTokenAndSetCookie(res, user._id, user.role);
    if (token) {
      // Redirect to the home/dashboard page if the token is successfully generated
      return res.redirect("/CWS");
    }

    // If all conditions are met, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error checking GitHub user:", error);
    return res.render("auth/signup.ejs", {
      ErrorMessage: "Internal Server Error in Sigin in with Github",
    });
  }
};
