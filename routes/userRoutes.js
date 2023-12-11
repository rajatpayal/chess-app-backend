const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const id = email;


        res.json({ token,id});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});
router.get('/players', async (req, res) => {
    try {
        const currentUserId = req.query.userId;
        console.log("Received User ID:", currentUserId);
        const users = await User.find({ email: { $ne: currentUserId }}).select('username -_id');// Fetch only usernames
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add more routes as needed...

module.exports = router;
