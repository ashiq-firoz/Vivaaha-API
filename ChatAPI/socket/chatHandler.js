const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const UserStatus = require('../models/UserStatus');

module.exports = (io) => {
    // Store active connections
    const userSockets = new Map();

    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.user;

        // Store socket connection
        userSockets.set(userId, socket.id);

        // Update user status to online
        try {
            await UserStatus.findOneAndUpdate(
                { userId },
                { 
                    userId,
                    isOnline: true,
                    lastSeen: new Date()
                },
                { upsert: true }
            );
            
            // Broadcast user's online status
            io.emit('user_status_change', { userId, isOnline: true });
        } catch (error) {
            console.error('Error updating user status:', error);
        }

        // Handle new message
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, text } = data;
                
                // Save message to database
                const message = new Message({
                    senderId: userId,
                    receiverId,
                    text
                });
                await message.save();

                // Send message to receiver if online
                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        message,
                        sender: userId
                    });
                }

                // Send confirmation to sender
                socket.emit('message_sent', { message });
            } catch (error) {
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle typing status
        socket.on('typing_start', async ({ receiverId }) => {
            try {
                await UserStatus.findOneAndUpdate(
                    { userId },
                    { 
                        isTyping: true,
                        typingTo: receiverId
                    }
                );

                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('typing_status', {
                        userId,
                        isTyping: true
                    });
                }
            } catch (error) {
                console.error('Error updating typing status:', error);
            }
        });

        socket.on('typing_end', async ({ receiverId }) => {
            try {
                await UserStatus.findOneAndUpdate(
                    { userId },
                    { 
                        isTyping: false,
                        typingTo: null
                    }
                );

                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('typing_status', {
                        userId,
                        isTyping: false
                    });
                }
            } catch (error) {
                console.error('Error updating typing status:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            try {
                // Remove socket connection
                userSockets.delete(userId);

                // Update user status to offline
                await UserStatus.findOneAndUpdate(
                    { userId },
                    { 
                        isOnline: false,
                        lastSeen: new Date(),
                        isTyping: false,
                        typingTo: null
                    }
                );

                // Broadcast user's offline status
                io.emit('user_status_change', {
                    userId,
                    isOnline: false,
                    lastSeen: new Date()
                });
            } catch (error) {
                console.error('Error updating user status on disconnect:', error);
            }
        });
    });
};