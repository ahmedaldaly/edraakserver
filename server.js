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
app.use('/auth', require('./router/auth'))
app.use('/v1/api/category', require('./router/category'))
app.use('/v1/api/corses', require('./router/corses'))
app.use('/v1/api/cubscrib', require('./router/subscrib'))
app.listen(port,()=>{
    console.log(`server is running in port ${port}`)
})