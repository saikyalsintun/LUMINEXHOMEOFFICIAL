const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
    phone: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    fullName: { 
        type: String, 
        required: true, 
        uppercase: true 
    },
    lineId: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        lowercase: true, 
        trim: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    // Business Intelligence
    totalOrders: { 
        type: Number, 
        default: 0 
    },
    customerTag: { 
        type: String, 
        enum: ['New', 'Regular', 'VIP', 'Problematic'], 
        default: 'New' 
    },
    isBlacklisted: { 
        type: Boolean, 
        default: false 
    },
    adminNotes: {
        type: String,
        default: ""
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("User_Data", userDataSchema, "User_Data");