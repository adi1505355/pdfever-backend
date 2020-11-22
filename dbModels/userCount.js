const mongoose = require('mongoose');

const userCountSchema = mongoose.Schema({
    count:String
})

module.exports =  mongoose.model("userCount",userCountSchema);