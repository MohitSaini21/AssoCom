import User from "../models/userSchema.js";
import { encrypt } from "../utils/Crypto.js";
import { generateTokenAndSetCookie } from "../utils/createJwtTokenSetCookie.js";

export const CheckRequestType = async (req, res, next) => {
  try {
    const { id: githubId } = req.user;

    if (!githubId) {
      return res.status(400).json({ message: "GitHub ID is required" });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ githubId });

    if (!user) {
      // If user does not exist, call the next middleware
      return next();
    }

    if (!user.role) {
      const encryptedID = encrypt(user._id.toString());
      return res.redirect(`/home/fillRole/${encryptedID}`);
    }

    // If user exists and has a role, generate token and redirect
    const token = generateTokenAndSetCookie(res, user._id, user.role);
    if (token) {
      return res.redirect("/");
    }

    // If all conditions are met, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error checking GitHub user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
