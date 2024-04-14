const asyncHandler = require('express-async-handler')
const Event = require('../models/Event');
const fs = require('fs');
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const addEvent = asyncHandler(async (req, res) => {
    let bodyData = req.body;
    try {
        if (!bodyData.title || !bodyData.category || !bodyData.country || !bodyData.city || !bodyData.location || !bodyData.date || !bodyData.time.length || !bodyData.ticketPrice || !bodyData.seats) {
            return res.status(400).json({ success: false, message: "title, category, country, city, location, date, time, ticket price and seats are required." })
        }
        let body = { ...bodyData, addedBy: req.user._id }
        let event = await Event.create(body);
        if (event) {
            return res.status(200).json({ success: true, msg: "Event added successfully!", event });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// upload image
const uploadedImage = async (req, res) => {
    const { id, image } = req.body;
    try {
        let event = await Event.findById(id);
        if (event) {
            if (event.image !== "/events/no-image.jpg") {
                const existingFilename = event?.image.split('/').pop();
                const existingFilePath = path.join(__dirname, "..", 'public/events', existingFilename);
                if (fs.existsSync(existingFilePath)) {
                    fs.unlinkSync(existingFilePath);
                }
            }


            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `image_${uuidv4()}.png`;
            const uploadDir = path.join(__dirname, "..", 'public/events');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            let fullFileName = `/events/${filename}`
            event.image = fullFileName;
            event.save();
            return res.status(200).json({ success: true })
        } else {
            return res.status(400).json({ success: false, message: "Error in uploading image." })
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
};

// get my events
const getMyEvents = async (req, res) => {
    try {
        let data = await Event.find({ addedBy: req.user._id, isDeleted: false })
            .sort({ createdAt: -1 });
        if (data) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//delete event 
const delEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let event = await Event.findById(id);
        if (event) {
            event.isDeleted = true;
            event.save();
            return res.status(200).json({ success: true, msg: "Event deleted successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//get edit event 
const getEditEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let event = await Event.findById(id);
        if (event) {
            return res.status(200).json({ success: true, data: event })
        } else {
            return res.status(400).json({ success: false, message: "No event found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    addEvent,
    uploadedImage,
    getMyEvents,
    delEvent,
    getEditEvent,
}
