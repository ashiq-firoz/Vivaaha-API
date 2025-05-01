const Razorpay = require("razorpay");
const crypto = require("crypto");


const key_secret = process.env.RAZOPAY_SECRET;

const key_id = process.env.RAZOPAY_KEY;
const instance = new Razorpay({ key_id: key_id, key_secret: key_secret });



module.exports = {
  getOrderId: (amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        amount = Math.round(Number(amount)) * 100 + "";

        let options = {
          amount: amount, 
          currency: "INR",
          receipt: `order_rcptid_${crypto.randomBytes(8).toString('hex')}`,
        };

        await instance.orders.create(options, function (err, order) {
          console.log(order);
          orderid = order;
          resolve(orderid);
        });
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  },

  verifyPayment: (checkout) => {
    return new Promise(async (resolve, reject) => {
      try {
        const payment_id = checkout.razorpay_payment_id;
        const order_id = checkout.razorpay_order_id;
        const razorpay_signature = checkout.razorpay_signature;

        // Creating hmac object
        let hmac = crypto.createHmac("sha256", key_secret);

        // Passing the data to be hashed
        hmac.update(order_id + "|" + payment_id);

        // Creating the hmac in the required format
        const generated_signature = hmac.digest("hex");

        if (generated_signature == razorpay_signature) {
          //console.log("payment success");
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  },
};



/*
Code to call the above functions inside a route, make changes in the above code to match requirements

router.post("/getorderid",async(req,res)=>{
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).send({ error: "Amount is required" });
    }

    getOrderId(amount).then((response)=>{
      let orderId = response;
      if (response!=false){
        res.status(200).send({ "orderid": orderId });
      }
      else{
        res.status(500).send({ error: "Failed to create order" });
      }
    });
    
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});


router.post("/verifypayment",async(req,res)=>{
  try{
    console.log(req.body.razorpay_signature);
    console.log(req.body.razorpay_order_id);

    verifyPayment(req.body).then((response) => {
      if (response == false) {
        let url = process.env.FAILED_URL;
        res.redirect(url);
      } else {
        let url = process.env.SUCCESS_URL;
        
        res.redirect(url);
      }
    });
  }
  catch(err){
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
})



*/