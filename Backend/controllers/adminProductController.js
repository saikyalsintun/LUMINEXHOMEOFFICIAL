// const Product = require("../models/Product");

// // POST: Add a new product
// const adminCreateProduct = async (req, res) => {
//     try {
//         // ADDED: productStatus included in the destructuring
//         let { itemNo, category, material, productSize, productColor, remark, productStatus, image } = req.body;
        
//         // Validation: Ensure required fields are present
//         if (!itemNo || !category) {
//             return res.status(400).json({ message: "Item Number and Category are required." });
//         }

//         // --- LOGIC FOR VARIATIONS ---
//         // Converts comma-separated strings into actual Arrays for MongoDB
//         const formattedSize = typeof productSize === 'string' 
//             ? productSize.split(',').map(s => s.trim()) 
//             : productSize;

//         const formattedColor = typeof productColor === 'string' 
//             ? productColor.split(',').map(c => c.trim()) 
//             : productColor;
//         // --------------------------------

//         const newProduct = new Product({
//             itemNo,
//             category,
//             material,
//             productSize: formattedSize,   // Saved as Array: ["23 inch", "50 inch"]
//             productColor: formattedColor, // Saved as Array: ["White", "Black"]
//             remark,
//             productStatus,                // ADDED: Saved as String: "Hot Sales"
//             image
//         });

//         await newProduct.save();
//         res.status(201).json({ 
//             message: "Admin: Product added successfully!", 
//             product: newProduct 
//         });
//     } catch (error) {
//         res.status(400).json({ 
//             message: "Admin: Error adding product", 
//             error: error.message 
//         });
//     }
// };

// module.exports = { adminCreateProduct };

const Product = require("../models/Product");

// POST: Add a new product
const adminCreateProduct = async (req, res) => {
    try {
        // UPDATED: Added product_description to the destructuring
        let { 
            itemNo, 
            product_description, 
            category, 
            material, 
            productSize, 
            productColor, 
            remark, 
            productStatus, 
            image 
        } = req.body;
        
        // Validation: Added product_description to the required fields
        if (!itemNo || !category || !product_description) {
            return res.status(400).json({ 
                message: "Item Number, Category, and Product Description are required." 
            });
        }

        // --- LOGIC FOR VARIATIONS ---
        const formattedSize = typeof productSize === 'string' 
            ? productSize.split(',').map(s => s.trim()) 
            : productSize;

        const formattedColor = typeof productColor === 'string' 
            ? productColor.split(',').map(c => c.trim()) 
            : productColor;
        // --------------------------------

        const newProduct = new Product({
            itemNo,
            product_description,          // NEW: Saved to database
            category,
            material,
            productSize: formattedSize,   
            productColor: formattedColor, 
            remark,
            productStatus,                
            image
        });

        await newProduct.save();
        res.status(201).json({ 
            message: "Admin: Product added successfully!", 
            product: newProduct 
        });
    } catch (error) {
        res.status(400).json({ 
            message: "Admin: Error adding product", 
            error: error.message 
        });
    }
};

module.exports = { adminCreateProduct };