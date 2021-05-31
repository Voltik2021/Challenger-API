const mongoose = require('mongoose');
const {Schema} = mongoose;

const userShema = new Schema({
    login: String,
    password: String,
    name: String,
    token:String,
    salt:String
    
});

const User = mongoose.model('User', userShema);

module.exports = User;