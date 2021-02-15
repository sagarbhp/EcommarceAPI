const mongoose = require("mongoose");

const itemSchema = require("./Item");

const buyerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  shippingAddress: {
    line1: {
      type: String,
      required: true,
    },
    line2: String,
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
});

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
    type: buyerSchema,
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
