const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: String, // Firebase/Auth UID
    customer: {
        name: String,
        email: String,
        phone: String,
        lineId: String, // Added to match your new form
        address: String,
        deliveryInstructions: String // Added for better logistics
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        product_description: String,
        image: String,
        color: String,
        size: String,
        quantity: { type: Number, default: 1 }
    }],
    status: { 
        type: String, 
        default: "Pending",
        enum: ['Pending', 'Approved', 'Direct Contact', 'Order Made', 'Transporting', 'Received', 'Cancelled']
    },
    totalAmount: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema, "orders");