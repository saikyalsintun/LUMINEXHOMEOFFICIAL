const admin = require("firebase-admin");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;

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

// 6. Middleware (UPDATED FOR ADMIN PANEL)
app.use(cors({
  origin: "*", // For production, replace with "https://your-frontend-link.vercel.app"
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Added PATCH and OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// 7. API Routes
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes); // This handles /api/orders/...

// 8. Health Check / Root Route
app.get("/", (req, res) => {
  res.status(200).json({ 
      message: "Luminex API is live!",
      status: "Connected",
      timestamp: new Date()
  });
});

// 9. Vercel Serverless Export Logic
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running locally on port ${PORT}`));
}

module.exports = app;