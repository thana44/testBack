const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const {readdirSync} = require('fs')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const app = express()
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173',
        process.env.FRONTEND_HOST
    ],
}))
app.use(bodyParser.json({limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))
app.use(morgan('common'))
app.use(express.json())
app.use(cookieParser())

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    app.listen(5000, ()=>{
        console.log('Server is running on PORT 5000')
    })
}).catch(err=>console.log('can not connect DB..',err))

readdirSync('./routes').map((e)=>{
    console.log(e)
    app.use('/api/routes/', require('./routes/' + e))
})