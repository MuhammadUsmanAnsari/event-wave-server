const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({    
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    feedback: {
        type: String,
    }
},
    { timestamps: true }
);


module.exports = mongoose.model("Feedback", userSchema);
