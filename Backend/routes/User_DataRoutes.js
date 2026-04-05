const express = require("express");
const router = express.Router();
const UserData = require("../models/User_Data");

// GET: Find a customer by phone (Useful for auto-fill on checkout)
router.get("/:phone", async (req, res) => {
    try {
        const customer = await UserData.findOne({ phone: req.params.phone });
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Sync/Update customer data (Called during checkout)
router.post("/sync", async (req, res) => {
    const { phone, fullName, lineId, address, email } = req.body;
    
    try {
        // Find by phone and update, or create if new (upsert)
        const updatedCustomer = await UserData.findOneAndUpdate(
            { phone: phone },
            { 
                fullName, 
                lineId, 
                address, 
                email,
                $inc: { totalOrders: 1 } // Increment order count each time they buy
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        res.status(200).json(updatedCustomer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET: All customers for Admin Dashboard
router.get("/", async (req, res) => {
    try {
        const customers = await UserData.find().sort({ updatedAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;