
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date
});

// IMPORTANT: This must be module.exports
module.exports = mongoose.model('User', UserSchema);