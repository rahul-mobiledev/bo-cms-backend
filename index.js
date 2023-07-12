const express = require("express");
require("./loadEnvironment.js")
const cors = require("cors");
const asyncErrors = require("express-async-errors");
const bodyParser = require("body-parser");

const tests = require("./routes/test.js");
const login = require("./routes/login.js");

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load the /posts routes
app.use("/test", tests);

app.use("/login", login);

// Global error handling
app.use((err, _req, res, next) => {
 res.status(500).send("Uh oh! An unexpected error occured.")
//  res.status(500).send(err)
})

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
