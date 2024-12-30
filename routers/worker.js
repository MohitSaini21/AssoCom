import express from "express";
import User from "../models/userSchema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.render("WorkerDash/home", { user }); // Reference the file inside the ClientDash folder
});

export const workerRoute = router;
