const express = require("express");
const { db, dbLogin } = require("../db/conn.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let words = req.query.search.toLowerCase();
  let collection = db(req).collection("customer");
  let results = await collection.find({}).toArray();
  results = results.filter((element) => {
    return element.name.toLowerCase().includes(words) || element.no.includes(words);
  })
  res.send(results.reverse()).status(200);
});

router.get("/id", async (req, res) => {
  let id = req.query.id.toLowerCase();
  let collection = db(req).collection("customer");
  let results = await collection.findOne({
    _id : id
  });
  res.send(results).status(200);
});

router.post("/", async (req, res) => {
  let customer = req.body;
  let collection = db(req).collection("customer");
  let results = await collection.insertOne(customer);
  res.send(results).status(200);
});

router.put("/", async (req, res) => {
  let customer = req.body;
  let collection = db(req).collection("customer");
  let results = await collection.updateOne({
    _id: customer._id
  }, {
    $set: customer
  })
  res.send(results).status(200);
});

module.exports = router;
