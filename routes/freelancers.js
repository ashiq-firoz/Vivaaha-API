const express = require("express");
const Freelancer = require("../models/Freelancer");

const router = express.Router();

// Get all freelancers
router.get("/", async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a freelancer by ID
router.get("/:id", async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    res.json(freelancer);
  } catch (err) {
    res.status(404).json({ error: "Freelancer not found" });
  }
});

module.exports = router;
