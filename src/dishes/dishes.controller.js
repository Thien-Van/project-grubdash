const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish === undefined) {
    next({ status: 404, message: "No matching dish is found." });
  }
  res.locals.dish = foundDish;
  next();
}

function validateBody(req, res, next) {
  const { data } = req.body;
  const dishKeys = Object.keys(dishes[0]).splice(1);
  const dishKeysString = dishKeys.join(",");
  const dataKeys = Object.keys(data);
  const dataKeysString = dataKeys.join(",");

  //error messages
  const nameMissing = { status: 400, message: "Dish must include a name" };
  const descriptionMissing = {
    status: 400,
    message: "Dish must include a description",
  };
  const priceMissing = { status: 400, message: "Dish must include a name" };
  const priceWrong = {
    status: 400,
    message: "Dish must have a price that is an integer greater than 0",
  };
  const imageMissing = {
    status: 400,
    message: "Dish must include a image_url",
  };

  if (dataKeysString === dishKeysString) {
    console.log("they are");
  } else {
    let inCurrent = {};
    let missingKeys = [];
    for (let key of dataKeys) inCurrent[key] = true;
    for (let key of dishKeys) if (!inCurrent[key]) missingKeys.push(key);
  }
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function create(req, res, next) {
  const { data: dish } = req.body;
  console.log("dish", dish);
}

function update(req, res, next) {}

module.exports = {
  list,
  read: [dishExists, read],
  create: [validateBody, create],
  update: [dishExists, validateBody, update],
};
