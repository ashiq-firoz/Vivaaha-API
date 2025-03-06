const mongoose = require("mongoose");

const FreelancerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: ["Photographer", "Caterer", "Decorator", "Event Manager"], required: true },
    bio: { type: String },
    pricing: { type: Number, required: true },
    availability: [{ date: String, isBooked: Boolean }],
    ratings: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Freelancer", FreelancerSchema);
