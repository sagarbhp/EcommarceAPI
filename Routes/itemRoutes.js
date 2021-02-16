const express = require("express");
const mongoose = require("mongoose");
const requireToken = require("../Middleware/auth");
const updateBalance = require("../Helper/updateBalance");

//----------------------- Set Up ----------------------------------------------
const itemRouter = express.Router();
const User = mongoose.model("User");
const Store = mongoose.model("Store");
const Item = mongoose.model("Item");
const Order = mongoose.model("Order");

//----------------------- Add new item to store -------------------------------
itemRouter.post(
  "/items/additem/store/:storeID",
  requireToken,
  async (req, res) => {
    const storeID = req.params.storeID;
    const newItemData = req.body;
    const { user } = req;
    console.log("Starting operation to add item in store: ", storeID);
    try {
      let store = await Store.findById({ _id: storeID });
      console.log(store, user);
      if (!store) {
        return res.status(404).send("Store was not found");
      }

      if (store.ownerID != user._id) {
        return res.status(401).send("you can only add item to your own store");
      }

      newItemData.storeID = store._id;
      newItemData.ownerID = store.ownerID;
      newItemData.timeStamp = new Date();

      let item = new Item(newItemData);
      await item.save();
      return res.status(201).send(item);
    } catch (err) {
      console.log("Error occured while saving new item \n", err);
      res.status(422).send(err.message);
    }
  }
);

//------------------------ Get All items --------------------------------------
itemRouter.get("/items", async (req, res) => {
  console.log("Starting operation to get all items");
  try {
    items = await Item.find({});
    res.status(200).send(items);
  } catch (err) {
    console.log("Encountered err while getting items \n", err);
    res.status(500).send(err.message);
  }
});

//----------------------- Search item by name ----------------------------------
itemRouter.get(
  "/items/serach-by-name/:itemName",
  requireToken,
  async (req, res) => {
    let itemName = req.params.itemName;

    itemName = itemName.replace(/\+/gi, " ");
    console.log("Searching item by name: ", itemName);

    try {
      let items = await Item.find({ name: itemName });
      res.status(200).send(items);
    } catch (err) {
      console.log("Encountered error while getting data", err);
      res.status(500).send(err.message);
    }
  }
);

//----------------------- Get item by id ------------------------------------
itemRouter.get("/items/:itemID", requireToken, async (req, res) => {
  let itemID = req.params.itemID;
  console.log("Getting item by item id: ", itemID);

  try {
    let item = await Item.findById({ _id: itemID });
    res.status(200).send(item);
  } catch (err) {
    console.log("Encountered error while geeting item by id \n", err);
    res.status(422).send(err.message);
  }
});

//---------------------- Get all items in a store --------------------------
itemRouter.get("/items/store/:storeID", requireToken, async (req, res) => {
  const storeID = req.params.storeID;
  console.log("Getting all items from store: ", storeID);

  try {
    let items = await Item.find({ storeID });
    res.status(200).send(items);
  } catch (err) {
    console.log("Encountered error while geeting items by store id \n", err);
    res.status(422).send(err.message);
  }
});

//--------------------- Update Item ---------------------------------------
itemRouter.patch("/items/update/:itemID", requireToken, async (req, res) => {
  const itemID = req.params.itemID;
  const update = req.body;
  if (req.body && Object.keys(req.body).length === 0) {
    return res.status(422).send("No update parameter was given");
  }
  console.log("Starting operation to Update item with item id: ", itemID);

  try {
    let item = await Item.findById({ _id: itemID });
    if (!item) {
      console.log("No item found with provided id");
      return res.status(404).send("No item found with provided id");
    }
    if (item.ownerID != req.user._id) {
      console.log(
        "Authorization failed. user not permitted to update document"
      );
      return res
        .status(401)
        .send("Authorization failed. user not permitted to update document");
    }

    update.ownerID = item.ownerID;
    update.storeID = item.storeID;
    update.timeStamp = new Date();
    if (update.quantity) {
      update.quantity = updateBalance(item.quantity, update.quantity);
    }

    let newItem = await Item.findByIdAndUpdate({ _id: itemID }, update, {
      new: true,
    });
    res.status(200).send(newItem);
  } catch (err) {
    console.log("Encountered error with updating data", err);
    return res.status(500).send(err.message);
  }
});

//----------------------------- Delete Item-----------------------------------
itemRouter.delete("/items/remove/:itemID", requireToken, async (req, res) => {
  const itemID = req.params.itemID;
  console.log("Starting operation to delete item with item ID: ", itemID);

  try {
    item = await Item.findById({ _id: itemID });
    if (!item) {
      throw new Error("Could not find item with the given id");
    }

    if (item.ownerID != req.user._id) {
      throw new Error("Only owner of item can delete it");
    }
    await Item.deleteOne({ _id: itemID });
    return res.status(200).send("Successfully deleted");
  } catch (err) {
    console.log("Error encountered while deleting item \n", err);
    res.status(422).send(err.message);
  }
});

//--------------------------- Purchase item ---------------------------------
itemRouter.post("/items/purchase/:itemID", requireToken, async (req, res) => {
  const itemID = req.params.itemID;
  const { quantity } = req.body;
  if (!quantity || typeof quantity != "number") {
    return res.status(422).send("valid Quantity is needed to process request");
  }
  if (!req.user.balance) {
    return res.status(422).send("User does not have any balance");
  }
  try {
    item = await Item.findById({ _id: itemID });
    if (!item) {
      throw new Error("No document exists with given id");
    }
    if (item.quantity < quantity) {
      throw new Error("Not enough stock left to process purchase");
    }

    if (item.unitPrice * quantity > req.user.balance) {
      throw new Error("You don't have enough balance to purchase this item");
    }

    //counter and validator
    let counter = 1;
    let report = {};
    //to prevent concurrent overwrite this will try to update item 50 times without overwriting
    //it will give up after 50 times and item purchase will be declined
    do {
      report = await updateItemIfCurrent(itemID, quantity, req.user.balance);
      console.log(counter, report);
      counter++;
    } while (
      counter < 50 &&
      report.n === 0 &&
      report.nModified === 0 &&
      report.ok === 1
    );

    if (report.nModified !== 1) {
      throw new Error("Too many requests. Please order again later");
    }
    let newBalance = updateBalance(
      req.user.balance,
      -quantity * item.unitPrice
    );
    await User.findByIdAndUpdate(
      { _id: req.user._id },
      { balance: newBalance }
    );

    req.user.password = "It's encrypted anyway";

    let order = new Order({
      item,
      quantity,
      buyer: req.user,
      purchaseTime: new Date(),
      status: "placed",
    });

    await order.save();
    res.status(201).send(order);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

//-------------------Mongodb optimistic-concurrency for purchase -------
async function updateItemIfCurrent(itemID, quantity, balance) {
  item = await Item.findById({ _id: itemID });
  if (!item) {
    throw new Error("No document exists with given id");
  }
  if (item.quantity < quantity) {
    throw new Error("Not enough stock left to process purchase");
  }

  if (item.unitPrice * quantity > balance) {
    throw new Error("You don't have enough balance to purchase this item");
  }
  const timeStamp = item.timeStamp;
  let update = {};

  const filter = {
    _id: itemID,
    timeStamp,
  };
  update.quantity = item.quantity - quantity;
  update.timeStamp = new Date();

  let report = await Item.updateOne(filter, update);
  return report;
}

module.exports = itemRouter;
