const express = require('express');
const passport = require('passport');
const router = express.Router();
const googleAuthController = require('../controllers/google.auth');

// Initialize Google OAuth login

router.get('/',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get("/google",(req,res)=>{
    res.json({message:"Hello"})
})

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/google/error' }),
    googleAuthController.googleCallback
);

module.exports = router;