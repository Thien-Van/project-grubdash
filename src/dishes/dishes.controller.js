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
  const dataKeys = Object.keys(data);

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

  //list the missing keys and
  let inCurrent = {};
  let missingKeys = [];
  for (let key of dataKeys) inCurrent[key] = true;
  for (let key of dishKeys) if (!inCurrent[key]) missingKeys.push(key);

  //check if keys are all there and have the desired value
  if (missingKeys.length === 0) {
    if (data.name === "") {
      next(nameMissing);
    } else if (data.description === "") {
      next(descriptionMissing);
    } else if (data.price === undefined) {
      next(priceMissing);
    } else if (!Number.isInteger(data.price) || data.price <= 0) {
      next(priceWrong);
    } else if (data.image_url === "") {
      next(imageMissing);
    } else next();
  } else {
    if (missingKeys.includes("name")) {
      next(nameMissing);
    } else if (missingKeys.includes("description")) {
      next(descriptionMissing);
    } else if (missingKeys.includes("price")) {
      next(priceMissing);
    } else if (missingKeys.includes("image_url")) {
      next(imageMissing);
    }
  }
}

function validateId(req, res, next) {
  const { data } = req.body;

  if (Object.keys(data).includes("id") && data.id !== res.locals.dish.id) {
    next({
      status: 404,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  } else {
    res.locals.newBody = data;
    next();
  }
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function create(req, res, next) {
  const { data } = req.body;
  const newDish = {
    id: nextId(),
    name: data.name,
    description: data.description,
    price: data.price,
    image_url: data.image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
  console.log("dish", dish);
}

function update(req, res, next) {
  let existingDish = res.locals.dish;
  const newBody = res.locals.newBody;
  const updatedDish = {
    ...existingDish,
    name: newBody.name,
    description: newBody.description,
    price: newBody.price,
    image_url: newBody.image_url,
  };
  existingDish.name = newBody.name;
  existingDish.description = newBody.description;
  existingDish.price = newBody.price;
  existingDish.image_url = newBody.image_url;

  res.json({ data: updatedDish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [validateBody, create],
  update: [dishExists, validateBody, validateId, update],
};
