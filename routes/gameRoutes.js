const express = require('express');
const Game = require('../models/Game');
const router = express.Router();


app.post('/api/games', async (req, res) => {
    try {
        const newGame = new Game({ whitePlayer,blackPlayer});
        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to get a game by ID
app.get('/api/games/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).send('Game not found');
        }
        res.json(game);
    } catch (error) {
        res.status(500).send(error.message);
    }
});