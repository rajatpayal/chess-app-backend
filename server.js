const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const { Chess } = require('chess.js');
const cors = require('cors');
const server = http.createServer(app);
const { v4: uuidv4 } = require('uuid');



app.use(cors({
  origin: 'http://localhost:3000' 
}));

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST']
  }
});
app.use(express.json());

let userMap = {};

let players = [];

let activeGames = {};


io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('dummyMessage',(message)=>{
    console.log('Recieved message:',message);
  }
  )

  socket.on('addPlayer', ({userId,name}) => {

    console.log('now owreinds');
    const existingPlayer = players.find(player => player.name === name);
        if (!existingPlayer) {
            const newPlayer = { id: userId, name };
            players.push(newPlayer);
            userMap[newPlayer.id] = socket.id;
            io.emit('updatePlayers', players);
        }       
  });

  socket.on('playRequest', ({ from, to ,gameId}) => {
    const targetSocketId = userMap[to];
    if (targetSocketId) {
        io.to(targetSocketId).emit('gameInvitation', {from ,gameId});
    }
});
  socket.on('acceptInvitation', ({ gameId, invitingPlayerId }) => {

      const invitingPlayerId = userMap[invitingPlayerId];
      const invitedPlayerId = socket.id;

      const playerRoles = {
        white: invitingPlayerSocketId, // Inviter plays as white
        black: invitedPlayerSocketId  // Invitee plays as black
    };
      socket.join(gameId);
      io.to(userMap[invitingPlayerId]).emit('joinGameRoom', {gameId,playerRoles});
      console.log(invitingPlayerId);
      console.log(gameId);
    console.log('yha k to aya');

      const chess = new Chess();
     activeGames[gameId]=chess;

     console.log(activeGames[gameId]);
    // io.to(gameId).emit('startGame', (`/game/${gameId}`));
  });

  socket.on('joinRoom', (gameId) => {
    console.log('aaya to yha tk b tha');
    socket.join(gameId);
    
  
  });
  // socket.on('startGame', ({ gameId, opponentSocketId }) => {
  //   socket.join(gameId);
    
  //   io.to(opponentSocketId).join(gameId);

  //   const gameUrl = `/game/${gameId}`;
    
  //   const chess = new Chess();

  //   activeGames[gameId] = chess;
  //   // Notify both players to start the game
  //   io.to(gameId).emit('startGame', { gameUrl });
  //   io.to(gameId).emit('gameUpdate', chess.fen());
  // });

  

  socket.on('move', ({ gameId, move }) => {
    console.log(move);
    console.log(gameId);
    const chessGame = activeGames[gameId];
    if (chessGame && chessGame.move(move)) {
      io.to(gameId).emit('gameUpdate', chessGame.fen());
    } else {
      
      socket.emit('invalidMove');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/players', (req, res) => {
  res.status(200).json(players);
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
});