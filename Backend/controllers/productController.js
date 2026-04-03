// const Product = require("../models/Product");
// const cloudinary = require('cloudinary').v2;

// // ... Cloudinary config ...

// const getProducts = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     let query = {};

//     if (keyword && keyword.trim() !== "") {
//       const searchRegex = { $regex: keyword.trim(), $options: "i" };
      
//       // We use $or to check multiple fields for the same keyword
//       query = { 
//         $or: [
//           { itemNo: searchRegex },
//           { material: searchRegex },
//           { category: searchRegex },
//           { productColor: searchRegex },
//           // ADDED: This allows users to search for "Hot Sales", "Recommended", etc.
//           { productStatus: searchRegex } 
//         ]
//       };
//     }

//     const products = await Product.find(query);
    
//     // Check your Node terminal! It will tell you if it found matches.
//     console.log(`Search Term: "${keyword || 'ALL'}" | Matches Found: ${products.length}`);
    
//     res.json(products);
//   } catch (error) {
//     console.error("Search Error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// module.exports = { getProducts };

const Product = require("../models/Product");
const cloudinary = require('cloudinary').v2;

// ... Cloudinary config ...

const getProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    let query = {};

    if (keyword && keyword.trim() !== "") {
      const searchRegex = { $regex: keyword.trim(), $options: "i" };
      
      // We use $or to check multiple fields for the same keyword
      query = { 
        $or: [
          { itemNo: searchRegex },
          { material: searchRegex },
          { category: searchRegex },
          { productColor: searchRegex },
          // ADDED: This allows users to search for "Hot Sales", "Recommended", etc.
          { productStatus: searchRegex } 
        ]
      };
    }

    const products = await Product.find(query);
    
    // Check your Node terminal! It will tell you if it found matches.
    console.log(`Search Term: "${keyword || 'ALL'}" | Matches Found: ${products.length}`);
    
    res.json(products);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getProducts };