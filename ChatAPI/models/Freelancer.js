const mongoose = require("mongoose");

const FreelancerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyname : {
      type : String,
      required : true,
    },
    companymailid : {
      type : String,
      required: true,
    },
    registrationno: {
      type: String,
      default : ''
    },
    category: { type: String, enum: ["Venues", "Planning", "Decorations", "Photographers","Artists","Catering"], default:"Venues"},
    location:{
      type : String,
      default : "",
    },
    image1 : {
      type : String,
      default : "",
    },
    image2 : {
      type : String,
      default : "",
    },
    image3 : {
      type : String,
      default : "",
    },
    image4 : {
      type : String,
      default : "",
    },
    image5 : {
      type : String,
      default : "",
    },

    bio: { type: String, default:'' },
    pricing: { type: Number, default:'0' },
    availability: [{ date: String, isBooked: Boolean }],
    ratings: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    proofFile :{
      type: String,
      default : "",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Freelancer", FreelancerSchema);
