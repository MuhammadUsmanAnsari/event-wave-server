const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
    },
    comment: {
        type: String,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blogs"
    }
},
    { timestamps: true }
);


module.exports = mongoose.model("Comment-blog", userSchema);
