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
// These values must be added to your Vercel Environment Variables dashboard
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// 5. Firebase Admin Setup
// We check if an app already exists to prevent re-initialization errors on Vercel
if (!admin.apps.length) {
  try {
    // On Vercel, you will paste the content of your JSON key into this environment variable
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

//change

//change v2
// 6. Middleware
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // MUST include PATCH and DELETE
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

// 7. API Routes
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// 8. Health Check / Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Luminex API is live and running!" });
});

// 9. Vercel Serverless Export Logic
// In production, Vercel handles the port. Locally, we use 5000.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running locally on port ${PORT}`));
}

// CRITICAL: Vercel needs the app exported to treat it as a Serverless Function
module.exports = app;