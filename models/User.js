const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    idCard: {
        type: Number,
        maxlength: 13,
        minlength: 13,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

userSchema.methods.getJWToken = function () {
    const key = process.env.JWT_SECRET;
    return jwt.sign({ id: this._id, role: this.role, email: this.email }, key, {
        expiresIn: "100d",
    });
};

module.exports = mongoose.model("User", userSchema);
