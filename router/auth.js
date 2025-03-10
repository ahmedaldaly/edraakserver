const router = require('express').Router()
const {Register,login} = require('../controller/authController')
router.post('/register',Register)
router.post('/login',login)
module.exports=router;