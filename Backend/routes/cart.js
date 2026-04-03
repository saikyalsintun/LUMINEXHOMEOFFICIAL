// const express = require("express");
// const router = express.Router();
// const verifyToken = require("../middleware/verifyToken");
// const Cart = require("../models/Cart");
// const Product = require("../models/Product");

// /**
//  * GET CART
//  */
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.uid;

//     const cart = await Cart.findOne({ userId });

//     if (!cart || cart.items.length === 0) {
//       return res.json([]);
//     }

//     // Join product data
//    const detailedItems = await Promise.all(
//   cart.items.map(async item => {
//     const product = await Product.findById(item.productId);
//     return {
//       itemId: item._id,     // ⭐ IMPORTANT
//       product,
//       quantity: item.quantity || 1
//     };
//   })
// );

//     res.json(detailedItems);

//   } catch (err) {
//     console.error("Load cart error:", err.message);
//     res.status(500).json({ message: "Failed to load cart" });
//   }
// });

// /**
//  * ADD TO CART
//  */
// router.post("/add", verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.uid;
//     const { productId } = req.body;

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({
//         userId,
//         items: [{ productId, quantity: 1 }]
//       });
//     } else {
//       const item = cart.items.find(
//         i => i.productId.toString() === productId
//       );

//       if (item) {
//         item.quantity += 1;
//       } else {
//         cart.items.push({ productId, quantity: 1 });
//       }
//     }

//     await cart.save();
//     res.json({ message: "Added to cart" });

//   } catch (err) {
//     console.error("Add to cart error:", err.message);
//     res.status(500).json({ message: "Add to cart failed" });
//   }
// });

// // UPDATE quantity (+ / -)
// router.put("/:itemId", verifyToken, async (req, res) => {
//   const { action } = req.body; // "inc" or "dec"

//   const cart = await Cart.findOne({ userId: req.user.uid });
//   if (!cart) return res.status(404).json({ message: "Cart not found" });

//   const item = cart.items.id(req.params.itemId);
//   if (!item) return res.status(404).json({ message: "Item not found" });

//   if (action === "inc") item.quantity += 1;
//   if (action === "dec" && item.quantity > 1) item.quantity -= 1;

//   await cart.save();
//   res.json(cart.items);
// });


// // DELETE route
// router.delete("/:cartItemId", verifyToken, async (req, res) => {
//     const itemId = req.params.cartItemId;
//     const userUid = req.user.uid;

//     try {
//         const result = await Cart.updateOne(
//             { userId: userUid },
//             // Ensure this matches the field in your Mongoose schema
//             // If using Mongoose sub-documents, it is usually _id
//             { $pull: { items: { _id: itemId } } } 
//         );

//         if (result.modifiedCount > 0) {
//             res.status(200).json({ message: "Item deleted" });
//         } else {
//             // If you reach here, the ID was sent but didn't match anything in DB
//             res.status(404).json({ message: "Item not found in cart" });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server error during deletion" });
//     }
// });
// module.exports = router;



const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * 1. GET CART (Optimized with Populate)
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        // .populate handles the 'join' between Cart and Product collections for you
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.json([]);
        }

        // We format the data so the frontend can read it easily
        const detailedItems = cart.items
            .filter(item => item.productId) // Security: skip items if the product was deleted from DB
            .map(item => ({
                itemId: item._id,
                // Spread the product details so things like 'image' and 'itemNo' are easy to access
                product: item.productId, 
                color: item.color,
                size: item.size,
                quantity: item.quantity
            }));

        res.json(detailedItems);
    } catch (err) {
        console.error("Load cart error:", err.message);
        res.status(500).json({ message: "Failed to load cart" });
    }
});

/**
 * 2. ADD TO CART
 * Saves the specific variation to the database.
 */
router.post("/add", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId, color, size } = req.body;

        // Validation: Ensure variations were sent
        if (!color || !size) {
            return res.status(400).json({ message: "Color and Size are required selections." });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a brand new cart if one doesn't exist
            cart = new Cart({
                userId,
                items: [{ productId, color, size, quantity: 1 }]
            });
        } else {
            // Check if THIS EXACT combination already exists in the cart
            const existingItem = cart.items.find(
                i => i.productId.toString() === productId && 
                     i.color === color && 
                     i.size === size
            );

            if (existingItem) {
                existingItem.quantity += 1; // Just bump the number
            } else {
                // Add as a new unique line item
                cart.items.push({ productId, color, size, quantity: 1 });
            }
        }

        await cart.save();
        res.json({ message: "Added to cart successfully" });

    } catch (err) {
        console.error("Add to cart error:", err.message);
        res.status(500).json({ message: "Add to cart failed" });
    }
});

/**
 * 3. UPDATE QUANTITY
 * Increases or decreases quantity of a specific cart item ID.
 */
router.put("/:itemId", verifyToken, async (req, res) => {
    try {
        const { action } = req.body; // Expects "inc" or "dec"
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
 * Removes a specific variation from the cart.
 */
router.delete("/:cartItemId", verifyToken, async (req, res) => {
    const itemId = req.params.cartItemId;
    const userUid = req.user.uid;

    try {
        const result = await Cart.updateOne(
            { userId: userUid },
            { $pull: { items: { _id: itemId } } } 
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Item removed from cart" });
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during deletion" });
    }
});

module.exports = router;