const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  verified: { type: Boolean, default: false },

  verificationCode: { type: String },
  codeExpires: { type: Date }   
});

module.exports = mongoose.model('User', userSchema);
