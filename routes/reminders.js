const express = require("express");
const { db } = require("../db/conn.js");
const {sendFcmMessage , buildCommonMessage} = require("../fcm/fcm.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  sendFcmMessage(buildCommonMessage("test","test"));
  res.send().status(200);
});

router.post("/", async (req, res) => {
  let vendor = req.body;
  let collection = db(req).collection("vendors");
  let results = await collection.insertOne(vendor);
  res.send(results).status(200);
});

router.get("/", async (req, res) => {
  let id = req.query.id;
  let collection = db(req).collection("vendors");
  let results = await collection.findOne({
    _id : id
  });
  res.send(results).status(200);
});

router.post("/addPurchase", async (req, res) => {
  let purchase = req.body;
  let vendorId = req.query.id;
  let collection = db(req).collection("vendors");
  let results = await collection.updateOne({
    _id : vendorId
  },{
    $addToSet : {
      purchases : purchase
    },
    $inc : {
      due : Number(purchase.amount)
    }
  });
  res.send(results).status(200);
});

router.post("/addPayment", async (req, res) => {
  let payment = req.body;
  let purchaseId = req.query.purchaseId;
  let collection = db(req).collection("vendors");
  let results = await collection.updateOne({
    "purchases._id" : purchaseId
  },{
      $addToSet : {
        "purchases.$.payments" : payment
      },
    $inc : {
      due : -payment.amount,
      "purchases.$.due" : -payment.amount
    }
  });
  res.send(results).status(200);
});


module.exports = router;
