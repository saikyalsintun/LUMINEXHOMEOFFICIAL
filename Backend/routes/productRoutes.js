// const express = require("express");
// const router = express.Router();
// const { getProducts } = require("../controllers/productController");

// router.get("/", getProducts);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { getProducts } = require("../controllers/productController");

// Get all products or search products
router.get("/", getProducts);

// Example: You'll eventually need this to add products from the photo format
// router.post("/", createProduct); 

module.exports = router;