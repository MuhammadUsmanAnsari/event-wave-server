const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: Number,
        trim: true
    },
    quantity: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }

},
    { timestamps: true }
);


module.exports = mongoose.model("TicketReservation", userSchema);
