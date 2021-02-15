const mongoose = require("mongoose");

const itemSchema = require("./Item");
const userSchema = require("./User");

const orderSchema = new mongoose.Schema({
  item: {
    type: itemSchema,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  buyer: {
    type: userSchema,
    required: true,
  },
  purchaseTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

mongoose.model("Order", orderSchema);
