const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: String,
    customer: {
        name: String,
        email: String,
        phone: String,
        address: String
    },
    items: [{
        productId: mongoose.Schema.Types.ObjectId,
        product_description: String,
        image: String,
        color: String,
        size: String,
        quantity: Number
    }],
    // Updated: Added enum to ensure status follows our specific workflow
    status: { 
        type: String, 
        default: "Pending",
        enum: ['Pending', 'Approved', 'Direct Contact', 'Order Made', 'Transporting', 'Received', 'Cancelled']
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);