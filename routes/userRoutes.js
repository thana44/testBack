const express = require('express')
const userModels = require('../models/userModels')
const router = express.Router()
const cloudinary = require('../utils/cloudinary');

router.get('/getuserId/:id', async(req, res)=>{
    const id = req.params.id
    try{
        const getuser = await userModels.findOne({_id: id})
        return res.json(getuser)
    }catch(err){
        console.log(err)
    }
})

router.get('/getuserAll', async(req, res)=>{
    try{
        const getalluser = await userModels.find()
        return res.json(getalluser)
    }catch(err){
        console.log(err)
    }
})

router.put('/follow/:id', async(req, res)=>{
    try{
        const id = req.params.id
        const myId = req.body.itme

        const follower = await userModels.findOneAndUpdate({_id: id}, {$push: {followers: myId}},{new:true})
        const following = await userModels.findOneAndUpdate({_id: myId}, {$push: {following: id}},{new:true})

        res.json({
            flwer: follower,
            flwing: following
        })
        
    }catch(err){
        console.log(err)
    }
})
router.put('/unfollow/:id', async(req, res)=>{
    try{
        const id = req.params.id
        const myId = req.body.itme

        const follower = await userModels.findOneAndUpdate({_id: id}, {$pull: {followers: myId}},{new:true})
        const following = await userModels.findOneAndUpdate({_id: myId}, {$pull: {following: id}},{new:true})

        res.json({
            flwer: follower,
            flwing: following
        })
        
    }catch(err){
        console.log(err)
    }
})

router.get('/logout', async(req, res)=>{
    try{
        res.clearCookie('acess_token')
        return res.json({msg: 'Log out sucess.'})
    }catch(err){
        console.log(err)
    }
})

router.get('/following-list/:id', async(req, res)=>{
    try{
        const id = req.params.id
        const flwlist = await userModels.findOne({_id: id}).populate('following')
        if(flwlist.following.length === 0){
            return res.json({msg: 'No user.'})
        }
        return res.json(flwlist.following)
    }catch(err){
        console.log(err)
    }
})
router.get('/followers-list/:id', async(req, res)=>{
    try{
        const id = req.params.id
        const flwlist = await userModels.findOne({_id: id}).populate('followers')
        if(flwlist.followers.length === 0){
            return res.json({msg: 'No user.'})
        }
        return res.json(flwlist.followers)
    }catch(err){
        console.log(err)
    }
})

router.put('/update-profile/:id', async(req, res)=>{
    try{
        const {username, profileImg} = req.body
        const id = req.params.id

        if(!profileImg){
            const newName = await userModels.findOneAndUpdate({_id: id}, {username: username},{new:true})
            return res.json({newName})
        }
        const data = await cloudinary.uploader.upload(profileImg,{
            folder: 'profileFolder'
        })

        const user = await userModels.findOne({_id: id})

        if(user.profileimage.public_id){
            await cloudinary.uploader.destroy(user.profileimage.public_id)
        }
        const newPro = await userModels.findOneAndUpdate({_id: id},{
            username: username,
            profileimage: {
                public_id: data.public_id,
                url: data.secure_url
            }
        },{new:true})
        return res.json({newPro})
    }catch(err){
        console.log(err)
    }
})

router.get('/get-top-user', async(req, res)=>{
    try{
        const userTOP = await userModels.find({}).sort({totallike: -1}).limit(10)
        return res.json(userTOP)
    }catch(err){
        console.log(err)
    }
})

module.exports = router