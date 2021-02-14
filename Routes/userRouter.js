const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const emailValidator = require("../Middleware/emailValidator");
const hashPassword = require("../Middleware/hashPassword");
const requireToken = require("../Middleware/auth");
const updateBalance = require("../Helper/updateBalance");

//----------------------- Set Up ----------------------------------------------
dotenv.config();
const userRouter = express.Router();
const User = mongoose.model("User");

const jwtKey = process.env.JWT_KEY || "asdfghjkl!@33.?";

//--------------------- Get Logged in user info -----------------------------
userRouter.get("/user", requireToken, (req, res) => {
  req.user.password = undefined;
  res.status(200).send(req.user);
});

//---------------------- Update Self Info ------------------------------------
userRouter.patch("/update-user-info", requireToken, async (req, res) => {
  console.log("Starting process to update logged in user");
  if (req.body && Object.keys(req.body).length === 0) {
    return res.status(422).send("No update parameter was given");
  }
  if (req.body.email) {
    return res.status(422).send("Email update is not permitted yet");
  }
  //hashing if new password
  if (req.body.password) {
    let hashed;
    try {
      hashed = await bcrypt.hash(req.body.password, 10);
    } catch (err) {
      console.log("Could not hash password");
      return res.status(500).send("Could not complete request");
    }

    req.body.password = hashed;
  }

  //updating balance if balance is being added
  if (req.body.balance) {
    req.body.balance = updateBalance(req.user.balance, req.body.balance);
  }

  // setting filter and update
  const filter = { _id: req.user._id };
  const update = req.body;

  try {
    let newUser = await User.findOneAndUpdate(filter, update, { new: true });
    console.log("User updated successfully");
    newUser.password = undefined;
    return res.status(201).send(newUser);
  } catch (err) {
    console.log("Error in database update operation: ", err);
    return res.status(500).send(err.message);
  }
});

module.exports = userRouter;
