//-----------------------------------------------------------------------------
// Author: Sagar Roy
// Date: 13th Feb 2021
//
// ----------------------------------------------------------------------------

//------------------------------- imports -------------------------------------

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
require("./Models/User");
require("./Models/Store");
require("./Models/Item");
require("./Models/Order");
const authRouter = require("./Routes/authRoutes");
const userRouter = require("./Routes/userRouter");
const storeRouter = require("./Routes/storeRouter");
const itemRouter = require("./Routes/itemRoutes");
const orderRouter = require("./Routes/orderRoutes");

//------------------------------- Constants -----------------------------------
dotenv.config();

const PORT = process.env.PORT || 9000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/assessment";

//------------------------------- Server Config -------------------------------

const app = express();
app.use(bodyParser.json());

//------------------------------- Routers Config-------------------------------

app.use(authRouter);
app.use(userRouter);
app.use(storeRouter);
app.use(itemRouter);
app.use(orderRouter);

//------------------------------- DB Config -----------------------------------
mongoose.connect(MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log(`Connected to mongoDB at: ${MONGO_URI}`);
});

mongoose.connection.on("error", (err) => {
  console.log("Could not connect to mongo DB:", err);
});

//------------------------------Test Routes ---------------------------------------

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.status(201).send("Data received");
});

//-------------------------------- Listen -------------------------------------

module.exports = app.listen(PORT, () => {
  console.log(`Server Started on PORT: ${PORT}`);
});
