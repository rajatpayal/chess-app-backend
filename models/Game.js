const mongoose = require('mongoose');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

const gameSchema = new mongoose.Schema({
    gameId : {type:String,required:true},
    whitePlayer : {type:String,required:true},
    blackPlayer : {type:String,required:true},
})
// gameSchema.plugin(AutoIncrement, {inc_field: 'gameId'});
module.exports = mongoose.model('Game',gameSchema);