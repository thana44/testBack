const mongoose = require('mongoose');

const postModel = mongoose.Schema({
    discription: String,
    photo:{
        public_id:{
            type:String
        },
        url:{
            type:String
        }
    },
    likes:[{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    postedBy:{type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
}, {timestamps:true})

module.exports = mongoose.model('Posts', postModel);