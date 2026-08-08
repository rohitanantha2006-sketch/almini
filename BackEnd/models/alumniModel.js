const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  graduationYear: Number,
  group: String,
  membershipPlan: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Alumni", alumniSchema);
