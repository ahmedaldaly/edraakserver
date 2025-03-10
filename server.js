const express = require('express')
const app = express() 
const cors = require("cors");
const env = require ('dotenv')

env.config()
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
const conectdb = require('./config/db')
const port = process.env.port ;
conectdb()

// google
const session = require("express-session");
const passport = require("passport");
app.use(
    session({
      secret: "your_secret_key",
      resave: false,
      saveUninitialized: true,
    })
  );
  
  // تشغيل Passport
  app.use(passport.initialize());
  app.use(passport.session());
  

app.use('/auth', require('./router/auth'))
app.use('/v1/api/category', require('./router/category'))
app.use('/v1/api/corses', require('./router/corses'))
app.use('/v1/api/cubscrib', require('./router/subscrib'))
app.use('/v1/api/user', require('./router/user'))
app.listen(port,()=>{
    console.log(`server is running in port ${port}`)
})
