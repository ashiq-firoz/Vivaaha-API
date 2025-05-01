var express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { getOrderId, verifyPayment } = require('../helpers/razorpay_helper');
const auth = require('../middleware/auth_pay');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post("/status",(req,res)=>{
  res.json({status : "Alive"});
});


router.post("/getorderid",auth ,async (req, res) => {
  try {
    const { companyName, dates, location, totalPrice, vendorId } = req.body;

    const serviceCharge = totalPrice * 0.04; // 4% service charge
    const finalTotal = totalPrice + serviceCharge;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

   //todo verify if the totalcost is correct , fetch per day cost of freelancer from freelancer, multiply with no of days

    let cnt ="Email : "+ user.email + " | Phone : "+ user.phone
    const booking = new Booking({
      userId: req.user.id,
      freelancerId:vendorId,
      companyName,
      eventDates:dates,
      totalcost:finalTotal,
      contact:cnt,
      servicename:companyName,
      status:"pending", 
      event_completion_date: dates[dates.length - 1]
    });
    //console.log(booking)
    await booking.save();

    getOrderId(finalTotal).then((response)=>{
      let orderId = response;
      if (response!=false){
        console.log(orderId)
        console.log(booking)
        res.status(200).send({ "orderid": orderId,"bookingid":booking._id });
      }
      else{
        res.status(500).send({ error: "Failed to create order" });
      }
    });

    
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
});

router.post("/verifypayment", async (req, res) => {
  try {
    console.log(req.body.razorpay_signature);
    console.log(req.body.razorpay_order_id);
    console.log(req.query.id)

    verifyPayment(req.body).then(async (response) => {
      if (response == false) {
      let url = process.env.FAILED_URL;
      res.redirect(url);
      } else {
      // Update booking status to confirmed
      const booking = await Booking.findById(req.query.id);
      if (!booking) {
      
        return res.status(404).json({ error: 'Booking not found' });
      }
      booking.status = "confirmed";
      booking.paymentid = req.body.razorpay_order_id;
      await booking.save();
      console.log(booking)
      console.log("success")
      let url = process.env.SUCCESS_URL;
      res.redirect(url);
      }
    });

  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
});



router.get('/pending-bookings', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({
      event_completion_date: today,
      vendor_status: 'pending'
    })
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/bookings-with-cost', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .select('eventDates totalcost status servicename contact')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
