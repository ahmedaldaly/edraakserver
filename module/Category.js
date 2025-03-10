
const Joi = require('joi')
const mongoose = require('mongoose')
const Categoryschema = new mongoose.Schema({
    name:{
        required:true,
        type:String,
        trim:true,
        minLingth:5,
        maxLingth:50,
        unique:true
    },
    
})

const category = mongoose.model('category',Categoryschema)
function validateCategory(data) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required().trim()
    });

    return schema.validate(data);
}

module.exports = {category ,validateCategory};