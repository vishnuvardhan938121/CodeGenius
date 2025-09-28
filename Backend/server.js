require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  
const app = require('./src/app')   
app.use(cors())

// FIX: Load environment variables immediately upon module execution.
// This ensures process.env.MONGO_URI is defined when accessed below.
// This is necessary because the main entry file (index.js) imports this module 
// before running app.listen.


// --- 1. CONFIGURATION ---


// Read MONGO_URI from environment variables
const MONGO_URI = process.env.MONGO_URI; 

// Middleware setup
app.use(cors());
app.use(express.json());

// --- 2. MONGODB CONNECTION ---
if (!MONGO_URI) {
    // Helpful error message if the environment variable is missing
    console.error("FATAL ERROR: MONGO_URI is not defined. Please verify your .env file is in the root directory!");
} else {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('MongoDB connected successfully.'))
      .catch(err => console.error('MongoDB connection error:', err));
}


// --- 3. MONGOOSE SCHEMA AND MODEL ---

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Pre-save hook: Hash the password before saving a new user
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare candidate password with the stored hash
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);


// --- 4. REGISTER ENDPOINT: /api/register ---
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newUser = new User({ username, email, password });
        await newUser.save();

        console.log(`Registered new user: ${username}`);
        res.status(201).json({ message: 'Registration successful. Please log in.' });

    } catch (error) {
        console.error("Registration error:", error.message);
        // Handle MongoDB duplicate key error (code 11000)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Username or Email already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


// --- 5. LOGIN ENDPOINT: /api/login ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Compare provided password with the stored HASH
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Login successful!
        // Generate a mock Auth Token (In a real app, this would be a JWT)
        const authToken = crypto.randomUUID(); 
        
        console.log(`User logged in: ${username}. Token: ${authToken}`);

        // Send the token and user ID back to the frontend for session management
        res.status(200).json({ 
            message: 'Login successful', 
            token: authToken,
            userId: user._id.toString() // Send Mongo ID
        });
        
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// Export the configured Express app instance
module.exports = app;
