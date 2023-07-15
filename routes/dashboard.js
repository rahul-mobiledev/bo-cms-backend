const express = require("express");
const { db } = require("../db/conn.js");
const {datesAreOnSameDay, datesAreOnSameMonth,getMonthInYear,getDaysInMonth} = require("../utils/time.js");

const router = express.Router();

router.post("/", async (req, res) => {
  let request = req.body;
  let collection = db(req).collection("order");
  let orders = await collection.find({}).toArray();
  let response = {
    todayCollection : {
      amount : getCollection(orders,new Date(request.date),false),
      goal : 10000,
      orders : getOrders(orders,new Date(request.date),false)
    },
    monthCollection : {
      amount : getCollection(orders,new Date(request.date),true),
      goal : 250000,
      orders : getOrders(orders,new Date(request.date),true)
    },
    monthFilterCollection : getMonthCollectionDaily(orders,request.monthlyCollectionDate),
    yearFilterCollection : getYearCollectionMonthly(orders,request.yearlyCollectionDate)
  }
  res.send(response).status(200);
});

function getCollection(orders,date,isMonthDate){
  let collection = 0;
  orders.forEach(order => {
    order.payments.forEach(payment => {
      let isTodayPayment;
      if(isMonthDate){
        isTodayPayment = datesAreOnSameMonth(date,new Date(payment.time));
      }
      else{
        isTodayPayment = datesAreOnSameDay(date,new Date(payment.time));
      }
      
      if(isTodayPayment){
        collection += payment.amount;
      }
    })
  });
  return collection;
}

function getOrders(orders,date,isMonthDate){
  let totalOrder = 0;
  orders.forEach(order => {
    let isTodayOrder = true;
    let currentIndex = order.statusHistory.length
    while(currentIndex > 0){
      let status = order.statusHistory[currentIndex-1];
      let matched;
      if(isMonthDate){
        matched = datesAreOnSameMonth(date,new Date(status.time))
      }
      else{
        matched = datesAreOnSameDay(date,new Date(status.time))
      }
      if(matched){
        currentIndex--;
      }
      else{
        isTodayOrder = false;
        break;
      }
    }
    if(isTodayOrder){
      totalOrder++;
    }
  });
  return totalOrder;
}

function getMonthCollectionDaily(orders,date){
  return getDaysInMonth(new Date(date).getMonth() , new Date(date).getFullYear()).map((e)=>{
    return {
      dayMonth : e.getDate(),
      amount : getCollection(orders,e,false)
    }
  })
}

function getYearCollectionMonthly(orders,date){
  return getMonthInYear(new Date(date).getFullYear()).map((e)=>{
    return {
      dayMonth : e.getMonth()+1,
      amount : getCollection(orders,e,true)
    }
  })
}

module.exports = router;
