const express = require("express");
const { db, dbLogin } = require("../db/conn.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let words = req.query.search.toLowerCase();
  let regexText = new RegExp(words);
  let collection = db(req).collection("customer");
  let results = await collection.find({
    $or : [
      {
        no : {
          $regex : regexText
        }
      },
      {
        name : {
          $regex : regexText
        }
      }
    ]
  }).toArray();

  res.send(results.reverse()).status(200);
});

router.get("/id", async (req, res) => {
  let id = req.query.id;
  let collection = db(req).collection("customer");
  let results = await collection.findOne({
    _id: id
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
