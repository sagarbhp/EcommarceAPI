const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerID: {
    type: String,
    required: true,
  },
  address: {
    line1: String,
    line2: String,
    city: String,
    province: String,
    postalCode: String,
    country: String,
  },
});

mongoose.model("Store", storeSchema);
