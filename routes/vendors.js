const express = require("express");
const { db } = require("../db/conn.js");
const { datesAreOnSameMonth,getMonthInYear } = require("../utils/time.js");

const router = express.Router();

// Get a list of 50 posts
router.get("/dashboard", async (req, res) => {
  let yearlyPaymentDate = req.query.yearlyPaymentDate
  let yearlyCreditsDate = req.query.yearlyCreditsDate
  let collection = db(req).collection("vendors");
  let result = await collection.find({}).toArray()
  let dueVendors = result.filter((e) => {
    return e.due != 0;
  })
  let totalDue = dueVendors.map((e) => e.due).reduce((acc, value) => acc + value, 0);
  res.send({
    total_due: totalDue,
    due_vendors: dueVendors.length,
    due_breakdown: dueVendors.map((e) => {
      return {
        name: e.name,
        due: e.due
      }
    }),
    vendors : result,
    yearly_payments : getYearlyPayments(result,yearlyPaymentDate),
    yearly_credits : getYearlyCredits(result,yearlyCreditsDate)
  }).status(200);
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
      due : -payment.amount
    }
  });
  res.send(results).status(200);
});

function getPayments(vendors,date,isMonthDate){
  let collection = 0;
  vendors.forEach((vendor) => {
    vendor.purchases.forEach((purchase) => {
      purchase.payments.forEach((payment) => {
        if(datesAreOnSameMonth(date , new Date(payment.time))){
          collection += payment.amount;
        }
      })
    })
  })
  return collection;
}

function getYearlyPayments(vendors,date){
  return getMonthInYear(new Date(date).getFullYear()).map((e)=>{
    return {
      dayMonth : e.getMonth()+1,
      amount : getPayments(vendors,e,true)
    }
  }).filter((e)=>{
    return e.amount !== 0;
  })
}

function getCredits(vendors,date,isMonthDate){
  let collection = 0;
  vendors.forEach((vendor) => {
    vendor.purchases.forEach((purchase) => {
        if(datesAreOnSameMonth(date , new Date(purchase.time))){
          collection += purchase.amount;
        }
    })
  })
  return collection;
}

function getYearlyCredits(vendors,date){
  return getMonthInYear(new Date(date).getFullYear()).map((e)=>{
    return {
      dayMonth : e.getMonth()+1,
      amount : getCredits(vendors,e,true)
    }
  }).filter((e)=>{
    return e.amount !== 0;
  })
}

module.exports = router;
