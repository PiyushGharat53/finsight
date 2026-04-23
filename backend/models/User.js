const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ""
  },
  // Category budgets stored as array of { category, amount }
  budgets: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ],
  // Saving goals — multiple goals supported
  goals: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);