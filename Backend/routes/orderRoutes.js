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

// 2. POST: Create a new order (Customer side)
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
        console.error("DATABASE SAVE ERROR:", error); 
        res.status(500).json({ message: "Failed to save order", error: error.message });
    }
});

// 3. GET: Fetch all orders (Admin side)
router.get("/all", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

/** * NEW ADDITION: Fetch a single order by ID 
 * This is CRITICAL for OrderStatus.html to work
 */
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order status", error: error.message });
    }
});

// 4. PATCH: Update Order Status (Approve/Cancel/Transport/Receive)
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true } 
        );

        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 5. DELETE: Remove an order
router.delete("/:id", async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
});

module.exports = router;