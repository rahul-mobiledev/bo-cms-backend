const express = require("express");
const { db } = require("../db/conn.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  res.send("Congrats").status(200);
});

module.exports = router;
