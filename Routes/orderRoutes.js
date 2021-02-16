const express = require("express");
const mongoose = require("mongoose");
const requireToken = require("../Middleware/auth");
const updateBalance = require("../Helper/updateBalance");

//----------------------- Set Up ----------------------------------------------
const orderRouter = express.Router();
const Order = mongoose.model("Order");
const User = mongoose.model("User");

orderRouter.get("/orders", requireToken, async (req, res) => {
  console.log("Starting operation to get all the orders");
  try {
    let orders = await Order.find({});
    return res.status(200).send(orders);
  } catch (err) {
    console.log("Encountered error while fetching all orders");
    return res.status(500).send(err.message);
  }
});

orderRouter.get("/orders/:orderID", requireToken, async (req, res) => {
  const orderID = req.params.orderID;
  console.log("Starting operation to get single oder with id: ", orderID);
  try {
    let order = await Order.findById({ _id: orderID });
    return res.status(200).send(order);
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

orderRouter.delete(
  "/orders/remove-as-buyer/:orderID",
  requireToken,
  async (req, res) => {
    const orderID = req.params.orderID;
    const { user } = req;
    console.log("Starting operation to delete order with orderID: ", orderID);
    try {
      order = await Order.findById({ _id: orderID });
      if (!order) {
        throw new Error("No order found with given id");
      }
      if (order.status !== "placed") {
        throw new Error("Shipped orders can't be removed by user");
      }

      if (String(order.buyer._id) != String(user._id)) {
        throw new Error("Only buyer can remove order");
      }
      //refund to the user
      let refund = order.item.unitPrice * order.quantity;
      let newBalance = updateBalance(user.balnce, refund);

      await Order.deleteOne({ _id: orderID });
      await User.findByIdAndUpdate({ _id: user._id }, { balance: newBalance });
      return res
        .status(200)
        .send(`Item was deleted successfully and user was refunded ${refund}`);
    } catch (err) {
      res.status(422).send(err.message);
    }
  }
);

orderRouter.delete(
  "/orders/remove-as-owner/:orderID",
  requireToken,
  async (req, res) => {
    const orderID = req.params.orderID;
    const { user } = req;
    console.log("Starting operation to delete order with orderID: ", orderID);
    try {
      order = await Order.findById({ _id: orderID });
      if (!order) {
        throw new Error("No order found with given id");
      }

      if (String(order.item.ownerID) != String(user._id)) {
        throw new Error("Only owner can remove order");
      }

      await Order.deleteOne({ _id: orderID });
      return res.status(200).send("Order was deleted successfully");
    } catch (err) {
      return res.status(422).send(err.message);
    }
  }
);

module.exports = orderRouter;
