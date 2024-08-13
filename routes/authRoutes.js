const express = require('express')
const router = express.Router()
const userModel = require('../models/userModels')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

router.use(cookieParser())

router.post('/register', async(req, res)=>{
    try{
        const {username, email, password} = req.body;
        if(!username || !email || !password){
            return res.json({msg: 'Please enter all information.'})
        }
        if(username.length <= 0 || username.length > 25){
            return res.json({msg: 'The username length must be between 1 and 25 characters.'})
        }
        const usernameInDT = await userModel.findOne({username: username})
        const emailInDT = await userModel.findOne({email: email})
        if(usernameInDT || emailInDT){
            return res.json({msg: 'The username or email is already in use.'})
        }
        const hashPassword = bcrypt.hashSync(password, 10)
        await userModel.create({username, email, password: hashPassword})
        return res.json({msg: 'The user created successfully.'})
    }catch(err){
        console.log(err)
    }
})

router.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.json({msg: 'Please enter all information.'})
        }
        const userInDT = await userModel.findOne({email: email})
        if(!userInDT){
            return res.json({msg: 'User not found.'})
        }
        const comparePass = bcrypt.compareSync(password, userInDT.password)
        if(!comparePass){
            return res.json({msg: 'Incorrect password.'})
        }else{
            const token = jwt.sign({_id: userInDT._id}, process.env.JWT_SECRET_KEY)
        const theTime = new Date(Date.now() + 3600000);
        res.cookie('acess_token', token, {secure:true,httpOnly:true,sameSite:'Strict',domain:'https://instasam-2p.netlify.app',expires: theTime}).json({currentUser: userInDT})
        }

    }catch(err){
        console.log(err)
    }
})

module.exports = router
