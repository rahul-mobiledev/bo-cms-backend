const express = require("express");
const { db } = require("../db/conn.js");
const excelToJson = require('convert-excel-to-json');
const multer = require('multer');
const upload = multer({ dest: "./temp/" });
const loadash = require('lodash');
const mongoDB = require('mongodb');
const router = express.Router();

router.get("/customers", upload.single('file'), async (req, res) => {
    const file = req.file;
    let result = excelToJson({
        sourceFile: file.path,
        columnToKey: {
            A: "_id",
            B: "name",
            C: "no",
            D: "rs",
            E: "rc",
            F: "ra",
            G: "rad",
            H: "ls",
            I: "lc",
            J: "la",
            K: "lad"
        }
    }).CustomerList

    result = loadash.uniqBy(result, "_id")
    result = result.map((e) => {
        return {
            _id: e._id + "",
            name: e.name,
            no: e.no + "",
            rightEye: {
                sph: powerToString(e.rs),
                cyl: powerToString(e.rc),
                axis: e.ra + "",
                add: powerToString(e.rad)
            },
            leftEye: {
                sph: powerToString(e.ls),
                cyl: powerToString(e.lc),
                axis: e.la + "",
                add: powerToString(e.lad)
            },
        }
    })


    let collection = db(req).collection("customer");
    let results = await collection.insertMany(result)
    res.send(results).status(200);
    // res.send(result)
})

router.get("/order", upload.single('file'), async (req, res) => {
    const file = req.file;
    let result = excelToJson({
        sourceFile: file.path,
    }).Orders

    result = result.map((e) => {
        let frames = []
        if (e.N !== 0) {
            frames.push({
                name: e.M,
                quantity: 1,
                rate: e.N,
                total: e.N
            })
        }

        let lenses = []
        if (e.R !== 0) {
            lenses.push({
                material: e.O,
                coating: e.Q,
                vision: e.L,
                brand: getEmptyIfUndefined(e.P),
                pair: 1,
                rate: e.R,
                total: e.R
            })
        }

        return {
            _id: new mongoDB.ObjectId(),
            customerId: getNullIfUndefined(e.A),
            orderTime: e.B,
            rightEye: {
                sph: powerToString(e.D),
                cyl: powerToString(e.E),
                axis: e.F + "",
                add: powerToString(e.G)
            },
            leftEye: {
                sph: powerToString(e.H),
                cyl: powerToString(e.I),
                axis: e.J + "",
                add: powerToString(e.K)
            },
            frameDetail: frames,
            lensDetail: lenses,
            discount: e.S,
            orderSummery: {
                framesTotal: e.N,
                lensTotal: e.R,
                subTotal: e.N + e.R,
                discount: e.S,
                total: e.T
            },
            payments: [
                {
                    mode: "cash",
                    type: "advance",
                    amount: e.U,
                    time: e.B
                },
                {
                    mode: "cash",
                    type: "remaining",
                    amount: e.V,
                    time: e.C
                }
            ],
            statusHistory: [
                {
                    time: e.B,
                    status: "active"
                },
                {
                    time: e.B,
                    status: "completed"
                },
                {
                    time: e.C,
                    status: "collected"
                },
            ]
        }
    })


    let collection = db(req).collection("order");
    let results = await collection.insertMany(result)
    res.send(results).status(200);
    // res.send(result)
})

function powerToString(power) {
    if (isNaN(power)) {
        if (power !== "-") return "-";
        return power;
    }
    else {
        let p = Number(power).toFixed(2);
        if (p > 0) {
            p = `+${p}`;
        }
        return p;
    }
}

function getNullIfUndefined(value) {
    if (value === undefined) {
        return null;
    }
    else {
        return value + "";
    }
}

function getEmptyIfUndefined(value) {
    if (value === undefined) {
        return "";
    }
    else {
        return value + "";
    }
}

module.exports = router;