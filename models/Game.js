const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId : {type:String,required:true},
    whitePlayer : {type:String,required:true},
    blackPlayer : {type:String,required:true},
    result : {type:String}
})

module.exports = mongoose.model('Game',gameSchema);