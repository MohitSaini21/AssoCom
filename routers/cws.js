import express from "express";
import User from "../models/userSchema.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const user = await User.findById(req.user.id);
  console.log(user);
  return res.render("CommonDash/home.ejs", { user });
});

export const cwsRoute = router;
