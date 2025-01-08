import express from "express";
import User from "../models/userSchema.js";
const router = express.Router();

router.get("/", async (req, res) => {
  return res.render("Dash/sharedDash/home.ejs", { user: req.user });
});

export const cwsRoute = router;
