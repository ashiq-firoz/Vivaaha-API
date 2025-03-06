const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' // Participants in the conversation
    }],
    messages: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Message' // Messages in the conversation
    }],
    lastMessage: { 
      type: Schema.Types.ObjectId, 
      ref: 'Message' // Reference to the last message in the conversation
    }},
    {
        timestamps: true
});

const conversation = mongoose.model("Conversation",conversationSchema);
module.exports = conversation;