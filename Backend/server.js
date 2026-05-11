const admin = require("firebase-admin");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose'); // Added mongoose for direct collection access

// 1. Import Routes
const cartRoutes = require("./routes/cart");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");

// 2. Initialize Environment Variables
dotenv.config();

// 3. Database Connection
connectDB();

// --- NEW: MONGODB MODELS FOR CHAIR & DINING ---
// This allows the server to talk to your specific collections in retailDB
const productSchema = new mongoose.Schema({
    id: String,
    description_cn: String,
    description_en: String,
    filename: String
});

// We specify 'Chair' and 'Dining' as the 3rd argument to match your MongoDB screenshot exactly
const Chair = mongoose.model('Chair', productSchema, 'Chair');
const Dining = mongoose.model('Dining', productSchema, 'Dining');
// ----------------------------------------------

// 4. Cloudinary Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// 5. Firebase Admin Setup
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin Initialized");
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
  }
}

const app = express();

// 6. Middleware
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cache-Control", "Pragma"]
}));

app.use(express.json());

// 7. API Routes
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// --- NEW: FETCH ROUTES FOR CHAIRS & DINING ---
app.get("/api/chairs", async (req, res) => {
    try {
        const data = await Chair.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chairs", error: error.message });
    }
});

app.get("/api/dining", async (req, res) => {
    try {
        const data = await Dining.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching dining items", error: error.message });
    }
});
// ----------------------------------------------

// 8. Health Check / Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Luminex API is live and running!" });
});

// 9. Vercel Serverless Export Logic
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running locally on port ${PORT}`));
}

module.exports = app;