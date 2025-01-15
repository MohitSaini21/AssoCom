import express from "express";
import User from "../models/userSchema.js";
const router = express.Router();
router.get("/", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dash/sharedDash/index.ejs", { user });
});
router.get("/feedBack", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dash/sharedDash/feedback.ejs", { user });
});
router.get("/profile", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dash/sharedDash/profile.ejs", { user });
});
router.get("/logout", (req, res) => {
  // The `authToken` cookie is cleared to log the user out of the session
  res.clearCookie("authToken");
  return res.redirect("/");
});

export const cwsRoute = router;
