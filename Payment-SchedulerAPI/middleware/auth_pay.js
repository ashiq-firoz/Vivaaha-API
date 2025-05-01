const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log(token)
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

    
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded)
            // Find user
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Attach user to request object
            req.user = user;
            next();

        } catch (error) {
            console.log(error)
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = auth;