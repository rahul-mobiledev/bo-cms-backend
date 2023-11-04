const express = require("express");
const { db } = require("../db/conn.js");
const { datesAreOnSameMonth,datesAreOnSameDay } = require("../utils/time.js");

const router = express.Router();

router.get("/", async (req, res) => {
  let time = req.query.time;
  let collection = db(req).collection("purchases");
  let results = await collection.find({}).toArray();
  let monthlyPurchasesAmount = 0;
  let dailyPurchasesAmount = 0;
  let dailyPurchases = [];
  let monthlyPurchases = [];
  results.forEach(p => {
    console.log(time);
    console.log(p.time);
    if(datesAreOnSameMonth(new Date(time),new Date(p.time))){
        monthlyPurchases.push(p);
        monthlyPurchasesAmount+=p.amount;
    }
    if(datesAreOnSameDay(new Date(time),new Date(p.time))){
      dailyPurchases.push(p);
      dailyPurchasesAmount+=p.amount;
    }
  })
  res.send({
    monthlyPurchasesAmount : monthlyPurchasesAmount,
    dailyPurchasesAmount : dailyPurchasesAmount,
    dailyPurchases : dailyPurchases,
    monthlyPurchases : monthlyPurchases
  }).status(200)
});

router.post("/", async (req, res) => {
  let purchase = req.body;
  let collection = db(req).collection("purchases");
  let results = await collection.insertOne(purchase);
  res.send(results).status(200);
});


module.exports = router;
