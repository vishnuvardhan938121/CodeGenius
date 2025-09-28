require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const crypto = require('crypto'); // We are replacing this with jsonwebtoken for tokens
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  
const jwt = require('jsonwebtoken'); // 1. ADDED: Import jsonwebtoken
const app = express(); // 2. FIX: Initialize express here, not from a separate file

// --- Configuration ---
const MONGO_URI = process.env.MONGO_URI; 
const JWT_SECRET = process.env.JWT_SECRET; // 3. ADDED: Get JWT Secret

app.use(cors());
app.use(express.json());

// 4. ADDED: Fatal check for JWT_SECRET
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Login/Auth will fail!");
    // In production, you might want to stop the server here
}

// --- Database Connection ---
if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
} else {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('MongoDB connected successfully.'))
      .catch(err => console.error('MongoDB connection error:', err));
}

// --- User Model Definition ---
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

// Pre-save hook to hash password
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

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// --- Registration Endpoint: /api/register ---
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
        
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Username or Email already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


// --- Login Endpoint: /api/login ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!JWT_SECRET) {
             // Handle this case if JWT_SECRET is missing even after the check
             throw new Error('JWT Secret is not configured on the server.');
        }

        // 1. Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // 2. Compare provided password with the stored HASH
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // 3. GENERATE AUTHENTICATION TOKEN (JWT)
        // Payload includes user ID and username
        const authToken = jwt.sign(
            { id: user._id, username: user.username }, 
            JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );
        
        console.log(`User logged in: ${username}. JWT Issued.`);

        // 4. Send response
        res.status(200).json({ 
            message: 'Login successful', 
            token: authToken,
            userId: user._id.toString() // Send Mongo ID
        });
        
    } catch (error) {
        console.error("Login error:", error.message);
        // 5. IMPROVED Error Response for Debugging
        res.status(500).json({ message: `Server error during login: ${error.message}` });
    }
});

// --- Server Startup (assuming you need this in the main file) ---

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// NOTE: Since you provided a full file, I included the app.listen here. 
// If your setup requires exporting 'app' and running 'app.listen' in another file, 
// remove the final section and uncomment the original module.exports = app; line.
// For a single-file backend like this, running app.listen here is standard.
