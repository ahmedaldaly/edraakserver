const mongoose = require('mongoose')
async function conectdb() {
    try{
       await mongoose.connect('mongodb+srv://ahmed2005:ahmed2005@cluster0.6qpat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(()=> console.log('db is connected'))
    }catch(err){
        console.log(err)
    }
}

module.exports = conectdb;