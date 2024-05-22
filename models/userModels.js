const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    username: String,
    profileimage:{
        public_id: {
            type: String
        },
        url: {
            type: String,
            default: 'https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0='
        }
    },
    email: String,
    password: String,
    mypost:[{type: mongoose.Schema.Types.ObjectId, ref: 'Posts'}],
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    totallike: {
        type: Number,
        default: 0
    }
}, {timestamps:true})

module.exports = mongoose.model('Users', userModel);