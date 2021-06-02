const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  console.log(orderId);
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

function validateId(req, res, next) {
  const { data } = req.body;

  console.log(Object.keys(data));
  if (Object.keys(data).includes("id") && data.id !== res.locals.order.id) {
    next({
      status: 404,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  } else {
    next();
  }
}

function validateStatus(req, res, next) {
  const { data } = req.body;
  if (!Object.keys(data).includes("status") || data.status === "") {
    next({
      status: 404,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  } else if (res.locals.order.status === "delivered") {
    next({
      status: 404,
      message: `A delivered order cannot be changed`,
    });
  } else {
    res.locals.newBody = data;
    next();
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
  console.log(orders);
  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
  let existingOrder = res.locals.order;
  const newBody = res.locals.newBody;
  const updatedOrder = {
    ...existingOrder,
    deliverTo: newBody.deliverTo,
    mobileNumber: newBody.mobileNumber,
    status: newBody.status,
    dishes: newBody.dishes,
  };
  existingOrder.deliverTo = newBody.deliverTo;
  existingOrder.mobileNumber = newBody.mobileNumber;
  existingOrder.status = newBody.status;
  existingOrder.dishes = newBody.dishes;

  res.json({ data: updatedOrder });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateBody, create],
  update: [orderExists, validateBody, validateId, validateStatus, update],
  delete: [orderExists, destroy],
};
