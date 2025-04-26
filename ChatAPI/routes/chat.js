const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const UserStatus = require('../models/UserStatus');
const User = require('../models/User');

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
    try {
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: req.user._id },
                        { receiverId: req.user._id }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$senderId', req.user._id] },
                            '$receiverId',
                            '$senderId'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    'user.email': 1,
                    'user.firstName': 1,
                    'user.lastName': 1,
                    lastMessage: 1
                }
            }
        ]);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get chat history with a specific user
router.get('/messages/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, receiverId: req.params.userId },
                { senderId: req.params.userId, receiverId: req.user._id }
            ]
        })
        .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get online status of a user
router.get('/status/:userId', auth, async (req, res) => {
    try {
        const status = await UserStatus.findOne({ userId: req.params.userId });
        if (!status) {
            return res.json({ isOnline: false, lastSeen: null });
        }
        res.json({ isOnline: status.isOnline, lastSeen: status.lastSeen });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (for chat contacts)
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('email firstName lastName');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;