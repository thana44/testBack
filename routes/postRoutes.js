const express = require('express')
const router = express.Router()
const cloudinary = require('../utils/cloudinary');
const postModels = require('../models/postModels');
const userModels = require('../models/userModels');

router.post('/create-posts', async (req, res)=>{
    try{
        const {dis, itme} = req.body
        const image = req.body.imgForsent

        if(!image || !dis){
            return res.json({msg: 'Please add all the information.'})
        }

        const data = await cloudinary.uploader.upload(image,{
            folder: "postFolder"
        })

        const thePost = await postModels.create({
            photo: {
                public_id: data.public_id,
                url: data.secure_url
            },
            discription: dis,
            postedBy: itme
        })

        const totalPost  = await userModels.findOneAndUpdate({_id: itme}, {$push: {mypost: thePost._id}},{new: true}) 

        const debug = await postModels.findOne({_id: thePost._id}).populate('postedBy', '_id username profileimage')

        return res.json({
            debug: debug,
            thePost: thePost,
            totalPost: totalPost
        })
    }catch(err){
        console.log(err)
    }
})

router.get('/get-post-of-profile/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const postOfprofile = await postModels.find({postedBy: id}).populate('postedBy', 'username profileimage _id').sort({createdAt: -1})
        if(postOfprofile.length === 0){
            return res.json({msg: 'No post.'})
        }
        return res.json(postOfprofile)
    }catch(err){
        console.log(err)
    }
})

router.get('/get-post-self-and-following/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const user = await userModels.find({_id: id})
   
        const post = await postModels.find({
            postedBy: [...user[0].following, id]
        }).sort({createdAt: -1}).populate('postedBy','profileimage username _id')

        if(!post){
            return res.json({msg: 'No post.'})
        }

        return res.json(post)

    }catch(err){
        console.log(err)
    }
})

router.get('/getpostId/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const post = await postModels.findOne({_id: id})
        return res.json(post)
    }catch(err){
        console.log(err)
    }
})

router.put('/update-post/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const {discription} = req.body
        const newDis = await postModels.findOneAndUpdate({_id: id}, {discription}, {new:true})
        return res.json(newDis)
    }catch(err){
        console.log(err)
    }
})

router.put('/delete-post/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const {myId} = req.body
        console.log(id, 'this is Id')
        
        const post = await postModels.findOne({_id: id}).populate('postedBy', '_id')
        if(!post){
            return res.json({msg: 'This post deleted.'})
        }
        const delPoint = await userModels.findOneAndUpdate({_id: post.postedBy._id},{$inc: {totallike: -post.likes.length} },{new:true})
        
       const newPoint =  await userModels.findOneAndUpdate({_id: myId}, {$pull: {mypost: id}},{new: true}) 

        await cloudinary.uploader.destroy(post.photo.public_id)
        const delpost = await postModels.findOneAndDelete({_id: id})

        return res.json({
            post,
            delPoint,
            newPoint,
            delpost
        })

    }catch(err){
        console.log(err)
    }
})

router.put('/like/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const {myId} = req.body

        const post = await postModels.findOneAndUpdate({_id: id}, {$push: {likes: myId}}, {new:true}).populate('postedBy', '_id')
        const user = await userModels.findOneAndUpdate({_id: post.postedBy._id}, {$inc: {totallike: 1}}, {new:true})

        return res.json({
            post,
            user
        })

    }catch(err){
        console.log(err)
    }
})

router.put('/unlike/:id', async (req, res)=>{
    try{
        const id = req.params.id
        const {myId} = req.body

        const post = await postModels.findOneAndUpdate({_id: id}, {$pull: {likes: myId}}, {new:true}).populate('postedBy', '_id')
        const user = await userModels.findOneAndUpdate({_id: post.postedBy._id}, {$inc: {totallike: -1}}, {new:true})

        return res.json({
            post,
            user
        })

    }catch(err){
        console.log(err)
    }
})

router.get('/get-user-list-in-like-post/:id',async (req, res)=>{
    try{
        const id = req.params.id
        const userList = await postModels.findOne({_id: id}).populate('likes', '_id username profileimage')
        return res.json(userList)
    }catch(err){
        console.log(err)
    }
})


module.exports = router