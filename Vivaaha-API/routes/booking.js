const express = require("express");
const Booking = require("../models/Booking");
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/bookservice", authMiddleware, async (req, res) => {
  try {
    const { companyName, dates, location, totalPrice, vendorId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let cnt ="Email : "+ user.email + " | Phone : "+ user.phone
    const booking = new Booking({
      userId: req.user.id,
      freelancerId:vendorId,
      companyName,
      eventDates:dates,
      totalcost:totalPrice,
      contact:cnt,
      servicename:companyName,
      status:"confirmed", //todo: change it when pay gateway is done
      event_completion_date: dates[dates.length - 1]
    });
    console.log(booking)
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all bookings of a user
router.get("/bookings", authMiddleware,async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vendorbookings", authMiddleware,async (req, res) => {
  try {
    const bookings = await Booking.find({ freelancerId: req.user.id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/userdetails", authMiddleware,async (req, res) => {
  try {
    const user = await User.findById(req.body.user).select('firstName email phone addressline1 city state');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bookedDates", authMiddleware, async (req, res) => {
  try {
    const { freelancerId } = req.body;
    const bookings = await Booking.find({ 
      freelancerId,
      status: "confirmed"
    }).select('eventDates');
    
    const bookedDates = bookings.reduce((dates, booking) => {
      return dates.concat(booking.eventDates);
    }, []);
    
    res.json(bookedDates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





module.exports = router;
