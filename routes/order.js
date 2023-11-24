const express = require("express");
const { db } = require("../db/conn.js");
const { datesAreOnSameDay } = require("../utils/time.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  let customerId = req.query.customerId;
  let collection = db(req).collection("order");
  let results = await collection.find({
    customerId: customerId
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
  let data = await collection.aggregate([
    {
      $match: {
        $expr: {
          $eq: [
            { $arrayElemAt: ["$statusHistory.status", -1] },
            "active"
          ]
        }
      }
    }
  ]).toArray();
  res.send(data.reverse()).status(200);
});

router.get("/completed", async (req, res) => {
  let collection = db(req).collection("order");
  let data = await collection.aggregate([
    {
      $match: {
        $expr: {
          $eq: [
            { $arrayElemAt: ["$statusHistory.status", -1] },
            "completed"
          ]
        }
      }
    }
  ]).toArray();
  res.send(data.reverse()).status(200);
});

router.get("/collected", async (req, res) => {
  let time = req.query.time;
  let isMonthly = req.query.isMonthly;
  time = time.substring(0, time.indexOf("T"))
  let collection = db(req).collection("order");
  if (time === "") {
    let data = await collection.find({
      "statusHistory": {
        $elemMatch: {
          "status": "collected"
        }
      }
    }).toArray();
    res.send(data.reverse()).status(200)
  }
  else if (isMonthly === "true") {
    let month = time.substring(0, time.length - 3)
    let data = await collection.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $arrayElemAt: ["$statusHistory.status", -1] },
                  "collected"
                ]
              },
              {
                $or: [
                  {
                    $eq: [
                      {
                        $substr: [
                          { $toString: { $arrayElemAt: ["$statusHistory.time", -1] } }, 0, 7
                        ]

                      },
                      month
                    ]
                  },
                  {
                    $eq: [
                      {
                        $substr: [
                          { $toString: "$orderTime" }, 0, 7
                        ]

                      },
                      month
                    ]
                  },
                ]
              }
            ]
          }
        }
      }
    ]).toArray()
    res.send(data).status(200);
  }
  else {
    let data = await collection.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $arrayElemAt: ["$statusHistory.status", -1] },
                  "collected"
                ]
              },
              {
                $eq: [
                  {
                    $substr: [
                      { $toString: { $arrayElemAt: ["$statusHistory.time", -1] } }, 0, 10
                    ]

                  },
                  time
                ]
              }
            ]
          }
        }
      }
    ]).toArray()
    res.send(data.reverse()).status(200);
  }
});

router.post("/moveToCompleted", async (req, res) => {
  let orderId = req.query.orderId;
  let time = req.query.time;
  let collection = db(req).collection("order");
  let results = await collection.updateOne({
    _id: orderId
  }, {
    $addToSet: {
      "statusHistory": {
        "time": time,
        "status": "completed"
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
    _id: orderId
  }, {
    $addToSet: {
      "statusHistory": {
        "time": payment.time,
        "status": "collected"
      },
      "payments": payment
    },
  });
  res.send(results).status(200);
});

module.exports = router;
