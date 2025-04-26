const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const Freelancer = require("../models/Freelancer");

const router = express.Router();

// Add a review
router.post("/",auth, async (req, res) => {
  try {
    let id = req.body.vendor
    if(req.body.vendor=="1"){
      id = req.user.id;
    }
    const reviews = await Review.find({ freelancerId: id });
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/review", auth, async (req, res) => {
  try {
    console.log(req.body);
    
    // Create new review
    const review = new Review({
      userId: req.user.id,
      freelancerId: req.body.vendorid,
      comment: req.body.comment,
      rating: req.body.rating,
    });
    await review.save();

    // Update freelancer ratings
    const freelancer = await Freelancer.findOne({ userId: req.body.vendorid });
    if (freelancer) {
      const currentRating = freelancer.ratings || 0;
      const currentTotalRatings = freelancer.totalRatings || 0;
      
      freelancer.ratings = ((currentRating * currentTotalRatings) + req.body.rating) / (currentTotalRatings + 1);
      freelancer.totalRatings = currentTotalRatings + 1;
      
      await freelancer.save();
    }

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
