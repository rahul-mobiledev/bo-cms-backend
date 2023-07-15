const express = require("express");
const { db } = require("../db/conn.js");
const {datesAreOnSameDay} = require("../utils/time.js");

const router = express.Router();

router.post("/", async (req, res) => {
  let request = req.body;
  let collection = db(req).collection("order");
  let orders = await collection.find({}).toArray();
  let response = {
    todayCollection : {
      amount : getTodaysCollection(orders,request.time),
      goal : 10000,
      orders : getTodaysOrders(orders,request.time)
    }
  }
  res.send(response).status(200);
});

function getTodaysCollection(orders,date){
  let collection = 0;
  orders.forEach(order => {
    order.payments.forEach(payment => {
      let isTodayPayment = datesAreOnSameDay(new Date(date),new Date(payment.time));
      if(isTodayPayment){
        collection += payment.amount;
      }
    })
  });
  return collection;
}

function getTodaysOrders(orders,date){
  let totalOrder = 0;
  orders.forEach(order => {
    let currentStatus = order.statusHistory[order.statusHistory.length -1];
    let isTodayOrder = datesAreOnSameDay(new Date(date),new Date(currentStatus.time));

    if(currentStatus.status === "active" && isTodayOrder){
      totalOrder++;
    }
  });
  return totalOrder;
}

module.exports = router;
