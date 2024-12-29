import express from "express";

const router = express.Router();
router.get("/", (req, res) => {
  return res.send("you are client");
});

export const clientRoute = router;
