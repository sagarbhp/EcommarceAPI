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
const storeRouter = express.Router();
const User = mongoose.model("User");
const Store = mongoose.model("Store");

const jwtKey = process.env.JWT_KEY || "asdfghjkl!@33.?";

//----------------------- Create new store -----------------------------------
storeRouter.post("/new-store", requireToken, async (req, res) => {
  userStores = [];
  if (req.user.storeIDs) {
    userStores = [...req.user.storeIDs];
  }
  console.log("Starting Create new store operation");
  try {
    store = new Store(req.body);
    store.ownerID = req.user._id;
    await store.save();

    userUpdate = { isOwner: true, storeIDs: [...userStores, store._id] };
    await User.findByIdAndUpdate({ _id: req.user._id }, userUpdate);

    newStore = await Store.findById(store._id);
    res.status(201).send(newStore);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//----------------------- Get All the stores ------------------------------
storeRouter.get("/stores", async (req, res) => {
  console.log("Starting operation to list stores");
  try {
    stores = await Store.find({});
    return res.status(200).send(stores);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//----------------------- Get Store with ID -------------------------------
storeRouter.get("/stores/:storeID", async (req, res) => {
  const storeID = req.params.storeID;
  console.log("Starting operation to list single store with id: ", storeID);
  try {
    store = await Store.findById({ _id: storeID });
    res.status(200).send(store);
  } catch (err) {
    res.status(422).send("Unprocessible entity");
  }
});

//----------------------- Search store with full name ---------------------
storeRouter.get("/stores/name/:storeName", requireToken, async (req, res) => {
  let storeName = req.params.storeName;
  storeName = storeName.replace(/\+/gi, " ");
  console.log("Searching store by full name: ", storeName);
  try {
    stores = await Store.find({ name: storeName });
    res.status(200).send(stores);
  } catch (err) {
    res.status(422).send("Unprocessible entity");
  }
});

//-------------------- Get All the user store by userID ---------------------------
storeRouter.get("/stores/owner/:ownerID", requireToken, async (req, res) => {
  const ownerID = req.params.ownerID;
  console.log("Getting stores with ownerID: ", ownerID);
  try {
    stores = await Store.find({ ownerID });
    res.status(200).send(stores);
  } catch (err) {
    res.status(422).send("Unprocessible entity");
  }
});

//------------------ Update Single Store ---------------------------------------
storeRouter.patch("/stores/update/:storeID", requireToken, async (req, res) => {
  const storeID = req.params.storeID;
  console.log(
    "Validating Update Store informartion operation for store ID: ",
    storeID
  );
  try {
    store = await Store.findById({ _id: storeID });
    if (store.ownerID != req.user._id) {
      console.log("Authorization Failed");
      return res.status(401).send("You can only update your own stores");
    }
    req.body.ownerID = req.user._id;

    // setting filter and update
    const filter = { _id: storeID };
    const update = req.body;

    updatedStore = await Store.findOneAndUpdate(filter, update, { new: true });
    return res.status(200).send(updatedStore);
  } catch (err) {
    console.log("Encountered error updating store", err);
    return res.status(500).send(err.message);
  }
});

//------------------ Delete Single Store ------------------------------------
storeRouter.delete(
  "/stores/remove/:storeID",
  requireToken,
  async (req, res) => {
    const storeID = req.params.storeID;
    console.log(
      "Validating Delete single store operation for store ID: ",
      storeID
    );

    try {
      store = await Store.findById({ _id: storeID });
      if (!store) {
        console.log("Could not find any document with provided store id");
        return res.status(404).send("Could not find any documet with given id");
      }
      if (store.ownerID != req.user._id) {
        console.log("Authorization Failed");
        return res.status(401).send("You can only delete your own stores");
      }

      let { deletedCount } = await Store.deleteOne({ _id: storeID });
      if (deletedCount != 1) {
        return res.status(422).send("Failed to delete store from database");
      }

      if (req.user.storeIDs) {
        let storeIDs = [];
        storeIDs = req.user.storeIDs.filter((id) => id != storeID);
        let update = {
          storeIDs,
        };
        if (storeIDs.length === 0) {
          update.isOwner = false;
        }
        User.updateOne({ _id: req.user.id }, update);
      }
      res.status(200).send("Successfully deleted document and updated user");
    } catch (err) {
      console.log("Encountered error deleting store", err);
      res.status(422).send(err.message);
    }
  }
);

module.exports = storeRouter;
