const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  color: String,
  size: String,
  quantity: Number
    }
  ]
});


module.exports = mongoose.model("Cart", cartSchema);
