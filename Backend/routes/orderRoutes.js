const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // Using the unified model
const admin = require("firebase-admin");

// --- 1. Middleware to verify Firebase Token ---
const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// --- 2. ADMIN ROUTES ---

// GET: Fetch ALL orders for Admin Dashboard
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

// PATCH: Update Order Status (Admin confirming/shipping)
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true } 
        );
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Status updated", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Admin removing an order
router.delete("/:id", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// --- 3. CUSTOMER ROUTES ---

// POST: Create a new order (from cart.js)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { customer, items, totalAmount } = req.body;
        const newOrder = new Order({
            userId: req.user.uid, // From decoded Firebase token
            customer: customer, 
            items: items,
            totalAmount: totalAmount,
            status: "Pending"
        });
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed!", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to save order", error: error.message });
    }
});

// GET: Fetch ALL orders for a specific user (History Page)
router.get("/history/:userId", async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Fetch the LATEST order (For orderStatus.html right after checkout)
router.get("/latest/:userId", async (req, res) => {
    try {
        const latestOrder = await Order.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        if (!latestOrder) return res.status(404).json({ message: "No orders found" });
        res.json(latestOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Fetch a SPECIFIC order by ID
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;