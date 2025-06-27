const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
require('dotenv').config();
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google.auth');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
    origin: ['*',"http://vivaaha.us","http://localhost:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Routes

//auth routes
app.use('/api/auth', googleAuthRoutes);  //change to authroute
app.use('/api/Auth', authRoutes);

app.use("/api/freelancers", require("./routes/freelancers"));
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/messages", require("./routes/message"));


// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Vivaha API' });
});

app.post("/api",auth,(req,res)=>{
    res.json({status:"True"});
})



app.get('/uploads/:folder/:file', (req, res) => {
    const { folder, file } = req.params;
    res.sendFile(path.join(__dirname, '.', 'uploads', folder, file));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;