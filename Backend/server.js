require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  
const app = require('./src/app')   
app.use(cors())


const MONGO_URI = process.env.MONGO_URI; 


app.use(cors());
app.use(express.json());


if (!MONGO_URI) {
   
    console.error("FATAL ERROR: MONGO_URI is not defined. Please verify your .env file is in the root directory!");
} else {
    mongoose.connect(MONGO_URI)
      .then(() => console.log('MongoDB connected successfully.'))
      .catch(err => console.error('MongoDB connection error:', err));
}




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


UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);



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

       
        const authToken = crypto.randomUUID(); 
        
        console.log(`User logged in: ${username}. Token: ${authToken}`);

       
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



module.exports = app;
