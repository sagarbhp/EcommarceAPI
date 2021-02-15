const mongoose = require("mongoose");
const { Parser } = require("json2csv");
const fs = require("fs");
require("./Models/Order");

const Order = mongoose.model("Order");
const LIMIT = 1;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/assessment";

//------------------------------- DB Config -----------------------------------
mongoose.connect(MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log(`Connected to mongoDB at: ${MONGO_URI}`);
  updateOrders();
});

mongoose.connection.on("error", (err) => {
  console.log("Could not connect to mongo DB:", err);
});
//--------------------------------------------------------

async function updateOrders() {
  let count = 0;
  let errorCount = 0;
  do {
    try {
      let orders = [];
      orders = await Order.find({ status: "placed" }).limit(LIMIT);
      csvWriter(orders);
      let filter = orders.map((order) => {
        return order._id;
      });
      let b = await Order.updateMany({ _id: filter }, { status: "shipped" });
      console.log(b);
      count = await Order.countDocuments({ status: "placed" });
      console.log(count);
    } catch (err) {
      console.log(err);
      count = 1;
      errorCount++;
    }
  } while (count != 0 && errorCount < 100);

  mongoose.connection.close();
}

//--------------------------------------------------------
function csvWriter(orders) {
  const fields = [
    {
      label: "Order ID",
      value: "_id",
    },
    {
      label: "Item ID",
      value: "item._id",
    },
    {
      label: "Quantity",
      value: "quantity",
    },
    {
      label: "Address Line 1",
      value: "buyer.shippingAddress.line1",
    },
    {
      label: "Address Line 2",
      value: "buyer.shippingAddress.line2",
    },
    {
      label: "City",
      value: "buyer.shippingAddress.city",
    },
    {
      label: "Province",
      value: "buyer.shippingAddress.province",
    },
    {
      label: "postalCode",
      value: "buyer.shippingAddress.postalCode",
    },
    {
      label: "Country",
      value: "buyer.shippingAddress.country",
    },
  ];
  let opts = {};

  const date = new Date();
  filePath = `./AutomationCSVFiles/order-data-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.csv`;
  if (fs.existsSync(filePath)) {
    opts = { fields, header: false };
  } else {
    opts = { fields };
  }
  const parser = new Parser(opts);
  let csv;

  csv = parser.parse(orders);
  csv = csv + "\r\n";

  fs.appendFileSync(filePath, csv);
}
