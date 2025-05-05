const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "Freelancer", required: true },
    eventDates: [{ type: String, required: true }], 
    totalcost : {type: Number},
    contact:{type:String},
    servicename: {type:String},
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    paymentid:{type:String},
    orderdate:{type:Date},
    event_completion_date : {type: String},
    vendor_status : { type: String, enum: ["pending", "in queue", "completed"], default: "pending" },
    vendor_paymentid : {type:String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
