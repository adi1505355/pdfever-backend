const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    email:String,
    feedback:String
})

module.exports =  mongoose.model("feedback",feedbackSchema);