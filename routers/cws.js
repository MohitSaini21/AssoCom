import express from "express";
import User from "../models/userSchema.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dash/sharedDash/home.ejs", { user });
});
router.get("/profile", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dash/sharedDash/profile.ejs", { user });
});
router.get("/Feedback", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dash/sharedDash/feedback.ejs", { user });
});

export const cwsRoute = router;
