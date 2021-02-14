const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const emailValidator = require("../Middleware/emailValidator");
const hashPassword = require("../Middleware/hashPassword");

//----------------------- Set Up ----------------------------------------------
dotenv.config();
const authRouter = express.Router();
const User = mongoose.model("User");

const jwtKey = process.env.JWT_KEY || "asdfghjkl!@33.?";

//------------------------ Sign Up (Post) Route -------------------------------
authRouter.post("/signup", async (req, res) => {
  console.log(
    "Received post Request to create new user with info: \n",
    req.body
  );
  console.log("Verifying email and password ");
  const { email, password } = req.body;
  if (!email || !password || password.length < 6 || !emailValidator(email)) {
    return res
      .status(422)
      .send(
        "Valid email and password(min length 6 chars) needed to process request"
      );
  }
  let hashed;
  try {
    hashed = await bcrypt.hash(password, 10);
  } catch (err) {
    console.log("Could not hash password");
    return res.status(500).send("Could not complete request");
  }

  req.body.password = hashed;

  console.log("Starting Data base operation for new user ", req.body);

  try {
    const user = new User(req.body);
    await user.save();

    // Creating json web token
    const token = jwt.sign({ userID: user._id }, jwtKey);
    res.status(201).send({ token });
  } catch (err) {
    console.log("Error saving new user in database: \n", err);
    res.status(422).send(err.message);
  }
});

//------------------------ Login (Post) Route --------------------------------
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: "Could not find user" });
  }
  try {
    await user.comparePassword(password);
    // Creating json web token
    const token = jwt.sign({ userID: user._id }, jwtKey);
    res.status(201).send({ token });
  } catch (err) {
    return res.status(422).send({ error: "authorization failed" });
  }
});

module.exports = authRouter;
