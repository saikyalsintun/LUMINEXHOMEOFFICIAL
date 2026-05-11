const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Cart = require("../models/Cart");

/**
 * 1. GET CART
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        // Populate now works dynamically across Product, Chair, and Table!
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.json([]);
        }

        const detailedItems = cart.items
            .filter(item => item.productId) 
            .map(item => ({
                itemId: item._id,
                product: item.productId, 
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                modelType: item.onModel // Useful for frontend logic
            }));

        res.json(detailedItems);
    } catch (err) {
        console.error("Load cart error:", err.message);
        res.status(500).json({ message: "Failed to load cart" });
    }
});

/**
 * 2. ADD TO CART (Modified for Dynamic Collections)
 */
router.post("/add", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId, color, size, category } = req.body; 

        if (!color || !size) {
            return res.status(400).json({ message: "Color and Size are required." });
        }

        // Determine which collection the item belongs to
        // We look at the category sent from home.js mapping
        let modelType = 'Product'; // Default
        if (category === "Chair") modelType = 'Chair';
        if (category === "Table" || category === "Dining Table") modelType = 'Table';

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ productId, color, size, quantity: 1, onModel: modelType }]
            });
        } else {
            const existingItem = cart.items.find(
                i => i.productId.toString() === productId && 
                     i.color === color && 
                     i.size === size
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.items.push({ productId, color, size, quantity: 1, onModel: modelType });
            }
        }

        await cart.save();
        res.json({ message: "Added to wishlist successfully" });

    } catch (err) {
        console.error("Add to cart error:", err.message);
        res.status(500).json({ message: "Add to wishlist failed" });
    }
});

/**
 * 3. UPDATE QUANTITY
 */
router.put("/:itemId", verifyToken, async (req, res) => {
    try {
        const { action } = req.body;
        const cart = await Cart.findOne({ userId: req.user.uid });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (action === "inc") item.quantity += 1;
        if (action === "dec" && item.quantity > 1) item.quantity -= 1;

        await cart.save();
        res.json({ message: "Quantity updated", items: cart.items });
    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
});

/**
 * 4. DELETE ITEM
 */
router.delete("/:itemId", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { itemId } = req.params;

        const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        if (!updatedCart) return res.status(404).json({ message: "Cart not found" });

        res.status(200).json({ 
            message: "Item removed successfully", 
            cartCount: updatedCart.items.length 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;