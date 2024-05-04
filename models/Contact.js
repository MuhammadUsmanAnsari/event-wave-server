const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },    
},
    { timestamps: true }
);


module.exports = mongoose.model("Contact", userSchema);
