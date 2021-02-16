const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const requireToken = require("../Middleware/auth");
const updateBalance = require("../Helper/updateBalance");

//----------------------- Set Up ----------------------------------------------
dotenv.config();
const userRouter = express.Router();
const User = mongoose.model("User");

//--------------------- Get Logged in user info -----------------------------
userRouter.get("/user", requireToken, (req, res) => {
  req.user.password = undefined;
  res.status(200).send(req.user);
});

//--------------------- Get All Users ---------------------------------------
userRouter.get("/users", requireToken, async (req, res) => {
  try {
    let users = await User.find({});
    if (!users || users.length === 0) {
      throw new Error("No user found");
    }
    //removing user password
    users.forEach((user) => {
      user.password = undefined;
    });
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//---------------------- Update Self Info ------------------------------------
userRouter.patch("/user/update-user-info", requireToken, async (req, res) => {
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
    try {
      req.body.balance = updateBalance(req.user.balance, req.body.balance);
    } catch (err) {
      console.log("Expected valid number", err);
      return res.status(422).send(err.message);
    }
  }
  //resetting isOwner and storeIds
  if (req.body.isOwner) {
    req.body.isOwner = req.user.isOwner;
  }
  if (req.body.storeIDs) {
    req.body.storeIDs = req.user.storeIDs;
  }
  //Merging address
  if (req.body.shippingAddress) {
    for (key in req.user.shippingAddress) {
      if (!req.body.shippingAddress[key]) {
        req.body.shippingAddress[key] = req.user.shippingAddress[key];
      }
    }
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
