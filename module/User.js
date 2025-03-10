const Joi = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,  // تصحيح التهجئة
    maxlength: 50,  // تصحيح التهجئة
    unique: true,   // تصحيح التهجئة
  },
  username: {
    required: true,
    type: String,
    minlength: 5,  // تصحيح التهجئة
    maxlength: 50,  // تصحيح التهجئة
    trim: true,
  },
  password: {
    required: true,
    type: String,
    trim: true,
    minlength: 8,  // تصحيح التهجئة
  
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
});

const user = mongoose.model("user", UserSchema);

function validateRegister(obj) {
  const schema = Joi.object({
    email: Joi.string().email().required().min(5).max(50).trim(),
    username: Joi.string().required().min(5).max(50).trim(),
    password: Joi.string().required().trim().min(8),
  });
  return schema.validate(obj);
}

function validateLogin(obj) {
  const schema = Joi.object({
    email: Joi.string().email().required().min(5).max(50).trim(),
    password: Joi.string().required().trim().min(8),
  });
  return schema.validate(obj);
}

module.exports = { user, validateRegister, validateLogin };
