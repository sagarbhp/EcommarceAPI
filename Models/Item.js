const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  storeID: {
    type: String,
    required: true,
  },
  ownerID: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  timeStamp: {
    type: Date,
    required: true,
  },
});

mongoose.model("Item", itemSchema);

module.exports = itemSchema;
