const admin = require("firebase-admin");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;
    next();

  } catch (err) {
    console.error("Verify token error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyToken;
