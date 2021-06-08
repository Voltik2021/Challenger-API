const mongoose = require('mongoose')
const {Schema} = mongoose;


const schemaChallenge = new Schema({
    title: String,
    status: String,
    description: String,
    prise: String,
    term: Number,    
    from: String,
    to:String,
    whoWasOffered:String,
    dateOfAcceptance: String,
    completionDate: String
})


const Challenge = mongoose.model('Challenge', schemaChallenge)

module.exports = Challenge;