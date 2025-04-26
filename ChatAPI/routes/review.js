const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

// Add a review
router.post("/", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all reviews for a freelancer
router.get("/freelancer/:freelancerId", async (req, res) => {
  try {
    const reviews = await Review.find({ freelancerId: req.params.freelancerId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
