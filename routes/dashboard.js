const express = require("express");
const { db } = require("../db/conn.js");
const {datesAreOnSameDay, datesAreOnSameMonth,getMonthInYear,getDaysInMonth} = require("../utils/time.js");

const router = express.Router();

router.post("/", async (req, res) => {
  let request = req.body;
  let collection = db(req).collection("order");
  let orders = await collection.find({}).toArray();
  let orderAmount = getOrdersAmount(orders,new Date(request.date));
  let ordersTotal = getOrders(orders,new Date(request.date));
  let collectionTotal = getCollection(orders,new Date(request.date));
  let response = {
    todayCollection : {
      amountTotal : orderAmount.todayAmount,
      amount : collectionTotal.collection,
      orders : ordersTotal.totalOrder
    },
    monthCollection : {
      amountTotal : orderAmount.monthlyAmount ,
      amount : collectionTotal.collectionMonthly,
      orders : ordersTotal.totalOrderMonthly
    },
    monthFilterCollection : getMonthCollectionDaily(orders,request.monthlyCollectionDate),
    yearFilterCollection : getYearCollectionMonthly(orders,request.yearlyCollectionDate)
  }
  res.send(response).status(200);
});

function getCollection(orders,date){
  let collection = 0;
  let collectionMonthly = 0;
  orders.forEach(order => {
    order.payments.forEach(payment => {
      if(datesAreOnSameMonth(date,new Date(payment.time))){
        collectionMonthly+= payment.amount;
      }
      if(datesAreOnSameDay(date,new Date(payment.time))){
        collection+= payment.amount;
      }
    })
  });
  return {
    collection : collection,
    collectionMonthly : collectionMonthly
  };
}

function getOrders(orders,date){
  let totalOrder = 0;
  let totalOrderMonthly = 0;
  orders.forEach(order => {
    let currentIndex = order.statusHistory.length
    while(currentIndex > 0){
      let status = order.statusHistory[currentIndex-1];
      let matched = false;
      if(datesAreOnSameMonth(date,new Date(status.time))){
        totalOrderMonthly++;
        matched = true;
      }
      if(datesAreOnSameDay(date,new Date(status.time))){
       totalOrder++;
       matched = true;
      }
      currentIndex--;
      if(matched){
        break;
      }
    }
  });
  return {
    totalOrder : totalOrder,
    totalOrderMonthly : totalOrderMonthly
  };
}

function getOrdersAmount(orders,date){
  let amountDaily = 0;
  let amountMonthly = 0;
  orders.forEach(order => {
    if(datesAreOnSameMonth(date,new Date(order.orderTime))){
      amountMonthly+=order.orderSummery.total;
    }
    if(datesAreOnSameDay(date,new Date(order.orderTime))){
      amountDaily+=order.orderSummery.total;
    }
  })
  return {
    todayAmount : amountDaily,
    monthlyAmount : amountMonthly
  };
}

function getMonthCollectionDaily(orders,date){
  return getDaysInMonth(new Date(date).getMonth() , new Date(date).getFullYear()).map((e)=>{
    return {
      dayMonth : e.getDate(),
      amount : getOrdersAmount(orders,e).todayAmount
    }
  }).filter((e)=>{
    return e.amount !== 0;
  })
}

function getYearCollectionMonthly(orders,date){
  return getMonthInYear(new Date(date).getFullYear()).map((e)=>{
    return {
      dayMonth : e.getMonth()+1,
      amount : getOrdersAmount(orders,e).monthlyAmount
    }
  }).filter((e)=>{
    return e.amount !== 0;
  })
}

module.exports = router;
