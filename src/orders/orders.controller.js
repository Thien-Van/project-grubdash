const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder === undefined) {
    next({ status: 404, message: "No matching order is found." });
  }
  res.locals.order = foundOrder;
  next();
}

function validateBody(req, res, next) {
  const deliverToMissing = {
    status: 400,
    message: "Order must include a deliverTo",
  };
  const mobileNumberMissing = {
    status: 400,
    message: "Order must include a mobileNumber",
  };
  const dishesMissing = {
    status: 400,
    message: "Order must include a dish",
  };
  const dishesEmpty = {
    status: 400,
    message: "Order must include at least one dish",
  };

  const { data } = req.body;
  const orderKeys = Object.keys(orders[0]).splice(1);
  const dataKeys = Object.keys(data);

  //list the missing keys
  let inCurrent = {};
  let missingKeys = [];
  for (let key of dataKeys) inCurrent[key] = true;
  for (let key of orderKeys) if (!inCurrent[key]) missingKeys.push(key);
  console.log("checking step 1");
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!STATUS??????????????????????????????????????????
  //check if keys are all there and have the desired value
  if (missingKeys.length === 0) {
    console.log("checking step 2");
    console.log(data.dishes.length);
    if (data.deliverTo === "") {
      next(deliverToMissing);
    } else if (data.mobileNumber === "") {
      next(mobileNumberMissing);
    } else if (!Array.isArray(data.dishes) || data.dishes.length === 0) {
      next(dishesEmpty);
    } else {
      console.log("checking step 3");
      const dishes = data.dishes;
      dishes.forEach((dish, index) => {
        if (
          !Object.keys(dish).includes("quantity") ||
          !Number.isInteger(dish.quantity) ||
          dish.quantity <= 0
        ) {
          next({
            status: 400,
            message: `Dish ${index} must have a quantity that is an integer greater than 0`,
          });
        }
      });
      console.log("checking step 4");
      next();
    }
    //  } else next();
  } else {
    if (missingKeys.includes("deliverTo")) {
      next(deliverToMissing);
    } else if (missingKeys.includes("mobileNumber")) {
      next(mobileNumberMissing);
    } else if (missingKeys.includes("dishes")) {
      next(dishesMissing);
    }
  }
}

function list(req, res, next) {
  res.json({ data: orders });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function create(req, res, next) {
  console.log("creating");

  const { data } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: data.deliverTo,
    mobileNumber: data.mobileNumber,
    status: data.status,
    dishes: data.dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {}

function destroy(req, res, next) {}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateBody, create],
  update: [orderExists, validateBody, update],
  delete: [orderExists, destroy],
};
