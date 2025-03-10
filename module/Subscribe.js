const mongoose = require('mongoose');

const SubscribeSchema = new mongoose.Schema ({
    userId:{
        required:true,
        type: mongoose.Schema.ObjectId,
        ref:'User'
    },
    subscrib:{
        required:true,
        type: mongoose.Schema.ObjectId,
        ref:'User'
    }
},{timestamps:true});
const Subscribe = mongoose.model('Subscribe',SubscribeSchema);


module.exports ={
    Subscribe
}