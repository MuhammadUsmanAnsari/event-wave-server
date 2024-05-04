const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    image: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        default: "Published"
    },
    views: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        default: []
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        default: []
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
},
    { timestamps: true }
);


module.exports = mongoose.model("Blogs", userSchema);
