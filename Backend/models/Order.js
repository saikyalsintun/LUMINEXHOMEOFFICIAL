const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    // Link to the Firebase/Auth UID for Customer lookup
    userId: { 
        type: String, 
        required: true, 
        index: true 
    }, 
    customer: {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        lineId: { type: String, required: true, trim: true },
        address: { type: String, required: true },
        email: { type: String, lowercase: true, trim: true },
        deliveryInstructions: { type: String, default: "None" }
    },
    items: [{
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        product_description: { type: String, required: true },
        image: { type: String },
        color: { type: String },
        size: { type: String },
        quantity: { type: Number, required: true, min: 1, default: 1 }
    }],
    status: { 
        type: String, 
        default: "Pending",
        // These statuses cover the entire lifecycle for both Admin and Customer
        enum: ['Pending', 'Approved', 'Direct Contact', 'Order Made', 'Transporting', 'Received', 'Cancelled']
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    // These allow you to add calculated fields later if needed
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// We name the collection 'orders' as your main file intended
module.exports = mongoose.model("Order", orderSchema, "orders");