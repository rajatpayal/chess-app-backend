const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

players= [];
userMap = {};

router.post('/register', async (req, res) => {
    try {
        const {userId, username, email, password } = req.body;

        let user = await User.findOne({ email });
       
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ userId,username, email, password });
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

        let user = await User.findOne({email:email });
        console.log(user);if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        
        console.log(user)

        const id = user.userId;
        const name = user.username;

        const newPlayer = {id:id,name:name};
        players.push(newPlayer);
        



        res.json({ token,id,name});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});
router.get('/players', async (req, res) => {
    try {
        const currentUserId = req.query.userId;
        console.log("Received User ID:", currentUserId);
        const users = await User.find({ userId: { $ne: currentUserId }}).select('username userId -_id');// Fetch only usernames
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
