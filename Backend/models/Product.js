const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  itemNo: { 
    type: String, 
    required: true 
  },
  // NEW: Added to store the product name (e.g., "Luxury Velvet Sofa")
  product_description: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  material: { 
    type: String, 
    required: true 
  },
  // Using [String] because your controller parses these into Arrays
  productSize: { 
    type: [String], 
    required: true 
  }, 
  productColor: { 
    type: [String], 
    required: true 
  },
  remark: { 
    type: String, 
    default: "New product" 
  }, 
  productStatus: { 
    type: String, 
    default: "" 
  }, 
  image: { 
    type: String 
  } 
}, { 
  timestamps: true 
});

// The third argument "products" ensures Mongoose points to the specific collection name
module.exports = mongoose.model("Product", productSchema, "products");