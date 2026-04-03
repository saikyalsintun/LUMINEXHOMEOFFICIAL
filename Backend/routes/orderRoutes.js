const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const admin = require("firebase-admin");

// 1. Middleware to verify Firebase Token
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

// 2. GET: Fetch all orders (Admin side)
// FIX: Changed from "/all" to "/" so the URL is just /api/orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

// 3. POST: Create a new order (Customer side)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { customer, items } = req.body;
        const newOrder = new Order({
            userId: req.user.uid,
            customer: customer, 
            items: items,
            status: "Pending"
        });
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to save order", error: error.message });
    }
});

// 4. GET: Single order (CRITICAL for orderStatus.html)
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. PATCH: Update Order Status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true } 
        );
        res.json({ message: "Status updated", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. DELETE: Remove order
router.delete("/:id", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;