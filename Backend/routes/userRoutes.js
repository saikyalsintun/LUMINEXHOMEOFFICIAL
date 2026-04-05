const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const User = require('../models/user');

/**
 * @route   POST /api/users/finalize-login
 * @desc    Verify Firebase ID Token after Email Link click and sync to MongoDB
 */
router.post('/finalize-login', async (req, res) => {
    const { idToken, firstName, lastName } = req.body;

    try {
        // 1. Verify the token from Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email } = decodedToken;

        // 2. Find or Create User
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            user = new User({
                email: email.toLowerCase(),
                firstName: firstName || "New",
                lastName: lastName || "User",
                isVerified: true // They verified via email link already
            });
            await user.save();
        } else {
            // Update status if they weren't verified before
            user.isVerified = true;
            await user.save();
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(401).json({ message: "Invalid Link or Token", error: error.message });
    }
});

module.exports = router;