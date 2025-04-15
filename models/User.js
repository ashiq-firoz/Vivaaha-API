const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  authType: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpiry: {
    type: Date
  },
  addressline1:{
    type: String,
    default: ""
  },
  adressline2:{
    type : String,
    default: ""
  },
  city:{
    type:String,
    default : ""
  },
  state:{
    type:String,
    default:"",
  },
  country:{
    type:String,
    default:""
  },
  pin:{
    type:String,
    default:"",
  },
  phone : {
    type : String,
    default:""
  },
  renewed : {
    type : String,
    default : "",
  },
  expriry : {
    type : String,
    default : "",
  }
 
}, {
  timestamps: true
});
const User = mongoose.model('User', userSchema);
module.exports = User;