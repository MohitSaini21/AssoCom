import User from "../models/userSchema.js";
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("Dashboard.ejs", { user });
});

router.get("/projects", (req, res) => {
  return res.send("hey");
});
export const dashboardRouter = router;
