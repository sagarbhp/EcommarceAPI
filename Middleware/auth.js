const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//----------------------- Set Up ----------------------------------------------
dotenv.config();
const jwtKey = process.env.JWT_KEY || "asdfghjkl!@33.?";
const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .send("You must be logged in to process this request");
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, jwtKey, async (err, payload) => {
    if (err) {
      return res
        .status(401)
        .send("You must be logged in to process this request");
    }
    const { userID } = payload;
    const user = await User.findById(userID);
    req.user = user;
    next();
  });
};
