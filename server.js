const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const { Chess } = require('chess.js');
const cors = require('cors');
const server = http.createServer(app);
const { v4: uuidv4 } = require('uuid');
const userRoutes = require('../chess-backend/routes/userRoutes');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chessGame', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));



app.use(cors({
  origin: '*' 
}));

const io = socketIo(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});
app.use(express.json());


app.use('/api/users', userRoutes);



let userMap = {};
let players = [];
let activeGames = {};


// app.post('/',(req,res)){
//   res.send()
// }



io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('dummyMessage',(message)=>{
    console.log('Recieved message:',message);
  }
  )

  socket.on('addPlayer', ({userId,name}) => {

    console.log('now friends');
    const existingPlayer = players.find(player => player.name === name);
        if (!existingPlayer) {
            const newPlayer = { id: userId, name };
            players.push(newPlayer);
            console.log({players});
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

    const invitingPlayerSocketId = userMap[invitingPlayerId];
    socket.join(gameId);
    
    io.to(invitingPlayerSocketId).emit('joinGameRoom', gameId);

      const playerRoles = {
        white: invitingPlayerSocketId, // Inviter plays as white
        black: socket.id // Invitee plays as black
      };

      const inviterIndex = players.findIndex(x=> x.id == invitingPlayerId);
      console.log(inviterIndex);
      const inviterName = players[inviterIndex].name;

      // const inviteeIdKey = userMap.keys(userMap).find(key=> userMap[key]== socket.id);
      // const inviteeIndex = players.findIndex(x=> x.id == inviteeIdKey);
      // const inviteeName = players[inviteeIndex].name;


      const playerNames = {
        white : inviterName,
        black : "inviteeName"
      }
      
      io.to(gameId).emit('startGame', { gameId, playerRoles,playerNames });
      // io.to(userMap[invitingPlayerId]).emit('joinGameRoom',gameId);
      const chess = new Chess();
      activeGames[gameId]=chess;
      // io.to('')
      // io.to(gameId).emit('startGame', (`/game/${gameId}`));
  });

  socket.on('joinRoom', (gameId) => {
    console.log("dfgdfgbfdxzcvxzsdfswdgsdfgsd");
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
      const isInCheck = chessGame.inCheck();
      const isCheckmate = chessGame.isCheckmate();
      const isDraw = chessGame.isDraw() || chessGame.isStalemate() || chessGame.isThreefoldRepetition()||chessGame.isInsufficientMaterial();
      io.to(gameId).emit('gameUpdate', { fen: chessGame.fen(), isInCheck ,isCheckmate,isDraw});
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