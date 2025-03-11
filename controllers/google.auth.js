//controllers/google.auth.js
const jwt = require('jsonwebtoken');

const googleAuthController = {
    // Handle Google auth callback
    async googleCallback(req, res) {
        console.log(req.user._id)
        try {
            // Generate JWT token
            const token = jwt.sign(
                { userId: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove sensitive information
            const user = req.user.toObject();
            delete user.password;
            delete user.googleId;
            //console.log(req.user)
            //console.log(token)
            let isnew = "0"; // 0 means false, 1 means true
            if(req.user.addressline1 == ""){
                isnew = 1;
            }
            
            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}&isnew=${isnew}`);

        } catch (error) {
            console.error('Google auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
        }
    }
};

module.exports = googleAuthController;