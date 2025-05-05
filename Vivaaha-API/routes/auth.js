
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const Freelancer = require('../models/Freelancer');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);

router.post('/submit-user-data', authMiddleware, async (req, res) => {
    try {
        const { name, addressLine1, addressLine2, city, state, country, pin, phone } = req.body;
        const userId = req.user;

        console.log(req.user)
        const user = await User.findOne({ email: userId.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            name,
            addressline1:addressLine1,
            addressline2:addressLine2,
            city,
            state,
            country,
            pin,
            phone
        }, { new: true });

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user data' });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const date = new Date();
        const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
        const formattedTime = `${date.getHours().toString().padStart(2,'0')}-${date.getMinutes().toString().padStart(2,'0')}-${date.getSeconds().toString().padStart(2,'0')}`;
        cb(null, `${formattedDate}_${formattedTime}_${file.originalname}`)
    }
});
const upload = multer({ storage: storage });

router.post('/business-data-submission', authMiddleware, upload.single('proofFile'), async (req, res) => {
    try {
        const {
            name, companyName, addressLine1, addressLine2,
            city, state, country, pin, phone,
            registrationNo, companyEmail
        } = req.body;
        const userId = req.user;

        const user = await User.findOne({ email: userId.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            name,
            addressline1:addressLine1,
            addressline2:addressLine2,
            city,
            state,
            country,
            pin,
            phone,
        }, { new: true });

        const freelancer = new Freelancer({
            userId: user._id,
            companyname:companyName,
            registrationno:registrationNo,
            companymailid:companyEmail,
            proofFile: req.file ? req.file.path : null
        });
        await freelancer.save();

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating business data' });
    }
});

// Protected routes
router.post('/change-password', authMiddleware, authController.changePassword);

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -verificationToken -verificationTokenExpiry ');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

router.post('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            phone, 
            addressline1, 
            adressline2, 
            city, 
            state, 
            country, 
            pin 
        } = req.body;

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                firstName,
                lastName, 
                email, 
                phone,
                addressline1,
                addressline2: adressline2, // correcting typo in field name
                city,
                state,
                country,
                pin
            },
            { new: true }
        ).select('-password -verificationToken -verificationTokenExpiry');

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});


module.exports = router;