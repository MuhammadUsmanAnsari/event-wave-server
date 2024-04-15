const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    location: {
        type: String,
    },
    date: {
        type: Date,
    },
    time: {
        type: Array,
    },
    organizerInfo: {
        type: String,
    },
    eventRules: {
        type: String,
    },
    schedule: [
        {
            time: String,
            details: String
        }
    ],
    speakers: [
        {
            name: String,
            details: String
        }
    ],
    ticketPrice: {
        type: Number,
    },
    tags: {
        type: String,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        default: "Published"
    },
    seats: {
        type: Number,
    },
    image: {
        type: String,
        default: "/events/no-image.jpg",
    },
    seatsBooked: {
        type: [{
            type: mongoose.Schema.Types.ObjectId
        }],
        default: []
    },
    views: {
        type: [{
            type: mongoose.Schema.Types.ObjectId
        }],
        default: []
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId
        }],
        default: []
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId
    }


},
    { timestamps: true }
);


module.exports = mongoose.model("Event", userSchema);
