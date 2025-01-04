import User from "../models/userSchema.js";
import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";

export const CheckRequestType = async (req, res, next) => {
  try {
    const { id: githubId, username, email, photos } = req.user; // Destructure properties from req.user

    if (!githubId) {
      return res.status(400).json({ message: "GitHub ID is required" });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ githubId });

    if (user) {
      if (generateTokenAndSetCookie(res, user._id, "worker")) {
        return res.redirect("/home/signin");
      }
    } else {
      // User does not exist, proceed to next middleware
      next();
    }
  } catch (error) {
    console.error("Error checking GitHub user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
