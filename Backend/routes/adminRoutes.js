const express = require("express");
const router = express.Router();
const { adminCreateProduct } = require("../controllers/adminProductController");

// This will be accessible at POST /api/admin/products
router.post("/products", adminCreateProduct);

module.exports = router;