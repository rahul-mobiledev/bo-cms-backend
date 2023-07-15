const express = require("express");
const { db } = require("../db/conn.js");
const {datesAreOnSameDay} = require("../utils/time.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let customerId = req.query.customerId;
  let collection = db(req).collection("order");
  let results = await collection.find({
    customerId : customerId
  }).toArray();
  res.send(results.reverse()).status(200);
});

router.post("/", async (req, res) => {
  let order = req.body;
  let collection = db(req).collection("order");
  let results = await collection.insertOne(order);
  res.send(results).status(200);
});

router.put("/", async (req, res) => {
  let order = req.body;
  let collection = db(req).collection("order");
  let results = await collection.updateOne({
    _id: order._id
  }, {
    $set: order
  })
  res.send(results).status(200);
});

router.get("/active", async (req, res) => {
  let collection = db(req).collection("order");
  let results = await collection.find({}).toArray();
  let data = results.filter((e)=>{
    return e.statusHistory[e.statusHistory.length -1].status === "active";
  })
  res.send(data.reverse()).status(200);
});

router.get("/completed", async (req, res) => {
  let collection = db(req).collection("order");
  let results = await collection.find({}).toArray();
  let data = results.filter((e)=>{
    return e.statusHistory[e.statusHistory.length -1].status === "completed";
  })
  res.send(data.reverse()).status(200);
});

router.get("/collected", async (req, res) => {
  let time = req.query.time;
  let collection = db(req).collection("order");
  let results = await collection.find({}).toArray();
  let data = results.filter((e)=>{
    let currentStatus = e.statusHistory[e.statusHistory.length -1];
    if(time === ""){
      return currentStatus.status === "collected";
    }
    return currentStatus.status === "collected" && datesAreOnSameDay(new Date(time),new Date(currentStatus.time));
  })
  res.send(data.reverse()).status(200);
});

router.post("/moveToCompleted", async (req, res) => {
  let orderId = req.query.orderId;
  let time = req.query.time;
  let collection = db(req).collection("order");
  let results = await collection.updateOne({
    _id : orderId
  },{
    $addToSet:{
      "statusHistory" : {
        "time" : time,
        "status" : "completed"
      }
    }
  });
  res.send(results).status(200);
});


router.post("/moveToCollected", async (req, res) => {
  let orderId = req.query.orderId;
  let payment = req.body;
  let collection = db(req).collection("order");
  let results = await collection.updateOne({
    _id : orderId
  },{
    $addToSet:{
      "statusHistory" : {
        "time" : payment.time,
        "status" : "collected"
      },
      "payments" : payment
    },
  });
  res.send(results).status(200);
});

module.exports = router;
