const express = require("express");
const { db , dbLogin } = require("../db/conn.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let collection = dbLogin.collection("admin");
  let results = await collection.find({
    username : req.query.username,
    password : req.query.password
  }).toArray();
  res.send({
    authorized : results.length != 0
  }).status(200);
});

module.exports = router;
