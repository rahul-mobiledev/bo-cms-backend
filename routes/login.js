const express = require("express");
const { db , dbLogin } = require("../db/conn.js");
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_TOKEN

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let res_token = ""
  let collection = dbLogin.collection("admin");
  let results = await collection.find({
    username : req.query.username,
    password : req.query.password
  }).toArray();
  if(results.length != 0){
    const token = jwt.sign(results[0], secretKey);
    res_token = token
  }
  res.send({
    authorized : results.length != 0,
    token : res_token
  }).status(200);
});

module.exports = router;
