
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);



// Protected routes
router.post('/change-password', authMiddleware, authController.changePassword);

router.get('/profile', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});
module.exports = router;