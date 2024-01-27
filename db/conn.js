const { MongoClient } = require("mongodb");
const connectionString = process.env.ATLAS_URI || "";
const client = new MongoClient(connectionString);

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
  } catch (e) {
    console.log(e)
  }
}

const db = function (req) {

  let dbRole = req.user.role
  try {
    if (dbRole === "production") {
      return client.db("production");
    }
    else if(dbRole === "develop"){
      return client.db("testMode");
    }
    else{
      return;
    }

  } catch (e) {
    console.log(e)
  }
}

run();


module.exports = {
  db: db,
  dbLogin : client.db("production")
};