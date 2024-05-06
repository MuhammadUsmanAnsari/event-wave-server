const asyncHandler = require('express-async-handler')
const Event = require('../models/Event');
const TicketReservation = require('../models/TicketReservation');
const Comment = require('../models/Comment');
const nodemailer = require('nodemailer')
const moment = require("moment");
const mongoose = require("mongoose");


let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    }
});


const addEvent = asyncHandler(async (req, res) => {
    let bodyData = req.body;
    try {
        if (!bodyData.title || !bodyData.category || !bodyData.country || !bodyData.city || !bodyData.location || !bodyData.date || !bodyData.time.length || !bodyData.ticketPrice || !bodyData.seats) {
            return res.status(400).json({ success: false, message: "title, category, country, city, location, date, time, ticket price and seats are required." })
        }
        let body = { ...bodyData, addedBy: req.user._id }
        let event = await Event.create(body);
        if (event) {
            return res.status(200).json({ success: true, msg: "Your event has been successfully submitted and is currently under review by our team. We'll notify you once it's been approved and published.", event });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});


// get my events
const getMyEvents = async (req, res) => {
    try {
        let data = await Event.find({
            $and: [
                { addedBy: req.user._id },
                { status: { $ne: "Deleted" } }
            ]
        })
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
            event.status = "Deleted";
            event.isDeleted = true;
            await event.save();
            return res.status(200).json({ success: true, msg: "Event deleted successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//get edit event 
const getEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let event = await Event.findById(id)
            .populate("addedBy",);
        if (event) {
            return res.status(200).json({ success: true, data: event })
        } else {
            return res.status(404).json({ success: false, message: "No event found" })
        }
    } catch (error) {
        console.log('checking=>', error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

//edit event 
const updateEvent = async (req, res) => {
    let { id } = req.query;
    try {
        let body = req.body;
        let event = await Event.findByIdAndUpdate(id, body, { new: true });
        if (event) {
            return res.status(200).json({ success: true, msg: "Event Updated successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "No event found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}



// get popular events by type
const getPopularEvents = async (req, res) => {
    const { type } = req.params;
    try {
        const events = await Event.aggregate([
            { $match: { category: type, status: "Published" } },
            { $addFields: { viewsLength: { $size: "$views" } } },
            { $sort: { viewsLength: -1 } },
            { $limit: 6 },

            // Optional: Project out the viewsLength field if you don't need it in the final result
            // { $project: { viewsLength: 0 } }
        ]);

        if (events.length > 0) {
            return res.status(200).json({ success: true, data: events })
        } else {
            return res.status(404).json({ success: false, })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}



// add view in event
const addView = async (req, res) => {
    const { id } = req.query;
    try {
        const event = await Event.findById(id);

        if (event) {
            let checkView = event?.views?.some(item => item.equals(req.user._id));
            if (!checkView) {
                event.views.push(req?.user?._id);
                event.save()
                return res.status(200).json({ success: true, })
            }
        } else {
            return res.status(404).json({ success: false, })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// add like in event
const addLike = async (req, res) => {
    const { id } = req.query;
    try {
        const event = await Event.findById(id);

        if (event) {
            let checkLike = event?.likes?.some(item => item.equals(req.user._id));
            if (!checkLike) {
                event.likes.push(req?.user?._id);
                await event.save()
                return res.status(200).json({ success: true, msg: "Event liked successfully!" })
            } else {
                let filtered = event?.likes?.filter(item => item.toString() !== req.user._id.toString());
                console.log(filtered);
                event.likes = filtered;
                await event.save()
                return res.status(200).json({ success: true, msg: "Event disliked successfully!" })
            }
        } else {
            return res.status(404).json({ success: false, message: "Event not exists" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// add addComment in event
const addComment = async (req, res) => {
    const { id } = req.query;
    try {
        const event = await Event.findById(id);

        if (event) {
            let body = { ...req.body, addedBy: req.user._id, eventId: event?._id }
            const comment = await Comment.create(body);
            event.comments.push(comment?._id);
            await event.save()
            return res.status(200).json({ success: true, msg: "Comment added successfully!" })
        } else {
            return res.status(404).json({ success: false, message: "Event not exists" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// get Comments in event
const getComments = async (req, res) => {
    let { limit, page, id } = req.query;
    if (!limit) limit = 10;
    if (!page) page = 1;
    limit = parseInt(limit);
    let skip = limit * (page - 1);

    try {
        const comments = await Comment.find({ eventId: id })
            .populate("addedBy eventId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const commentsCount = await Comment.find({ eventId: id });

        return res.status(200).json({ success: true, data: comments, count: commentsCount.length })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// delete Comment in event
const deleteComment = async (req, res) => {
    let { id } = req.query;

    try {
        const comment = await Comment.findById(id);

        if (comment) {
            if (comment?.addedBy.toString() == req.user._id.toString()) {
                let event = await Event.findById(comment?.eventId);
                let filtered = event?.comments?.filter(item => !item.equals(id));
                event.comments = filtered;
                await event.save();
                await Comment.findByIdAndDelete(id)
                return res.status(200).json({ success: true, msg: "Comment deleted successfully!" })
            } else {
                return res.status(404).json({ success: false, message: "You can delete your own comments." })
            }
        } else {
            return res.status(404).json({ success: false, message: "No comment found" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}



//rejectEventByAdmin event 
const rejectEventByAdmin = async (req, res) => {
    let { id, reason } = req.query;

    try {
        let event = await Event.findById(id)
            .populate("addedBy");
        if (event) {
            const mailOptions = {
                from: {
                    name: "Event Wave",
                    address: process.env.AUTH_EMAIL,
                },
                to: event?.addedBy?.email,
                subject: "Event Rejection",
                html: `<p>Dear ${event?.addedBy?.fullName}, </b>
                <br />
                <p>We regret to inform you that your event, "${event?.title}," scheduled to take place on ${moment(event?.date).format('MMM D, YYYY')} in ${event?.country}, ${event?.city}, has been rejected by our administration team.</p>
                <br />
                <p><b>Reason for rejection:<b></p>
                <blockquote>${reason}</blockquote>
                <br />                
                <p>Thank you for your understanding and cooperation.</p>
                <br />                
                <p>Best regards,</p>
                <br />                
                <b>EventWave</b>
                    `
            }
            await transporter.sendMail(mailOptions);
            await Event.findByIdAndDelete(id)
            return res.status(200).json({ success: true, msg: "Event rejected successfully!" })
        } else {
            return res.status(404).json({ success: false, message: "Event not found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//publishEventByAdmin event 
const publishEventByAdmin = async (req, res) => {
    let { id } = req.query;

    try {
        let event = await Event.findById(id)
            .populate("addedBy");
        if (event) {
            const mailOptions = {
                from: {
                    name: "Event Wave",
                    address: process.env.AUTH_EMAIL,
                },
                to: event?.addedBy?.email,
                subject: "Event Publication",
                html: `<p>Dear ${event?.addedBy?.fullName}, </b>
                <br />
                <p>We are delighted to inform you that your event, "${event?.title}," scheduled to take place on ${moment(event?.date).format('MMM D, YYYY')} in ${event?.country}, ${event?.city}, has been successfully published on our platform.</p>
                <br />
                <p>Your event has been approved by our administration team after a thorough review, and it now appears live on our website for attendees to discover and participate in.</p>
                <br/>                
                <p>Thank you for choosing our platform to host your event. We wish you great success and look forward to seeing a fantastic turnout!</p>               
                <br />                
                <p>Best regards,</p>
                <br />                
                <b>EventWave</b>
                    `
            }
            await transporter.sendMail(mailOptions);
            event.status = "Published";
            await event.save();
            return res.status(200).json({ success: true, msg: "Event published successfully!" })
        } else {
            return res.status(404).json({ success: false, message: "Event not found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


// get pending events
const getPendingEvents = async (req, res) => {
    try {
        let data = await Event.find({ status: "Pending" })
            .populate("addedBy");

        if (data) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// get upcoming events
const getUpcomingEvents = async (req, res) => {
    let { limit, page } = req.query;
    if (!limit) limit = 10;
    if (!page) page = 1;
    limit = parseInt(limit);
    let skip = limit * (page - 1);
    try {

        const data = await Event.aggregate([
            {
                $match: {
                    date: getNextWeekDates(),
                    status: "Published"
                }
            },
            {
                $sort: { date: 1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
        ]);

        const dataCount = await Event.aggregate([
            {
                $match: {
                    date: getNextWeekDates(),
                    status: "Published"
                }
            },
        ]);

        if (data) {
            return res.status(200).json({ success: true, data, count: dataCount.length })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getNextWeekDates = () => {
    const now = moment();
    const nextWeek = moment().add(2, 'week');
    return { $gte: now.toDate(), $lt: nextWeek.toDate() };
};


// get upcoming events
const getEventsUsingCategory = async (req, res) => {
    let { category, limit, page } = req.query;
    if (!limit) limit = 10;
    if (!page) page = 1;
    limit = parseInt(limit);
    let skip = limit * (page - 1);

    try {
        const data = await Event.aggregate([
            {
                $match: {
                    category,
                    status: "Published"
                }
            },
            {
                $sort: { date: 1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
        ]);
        const dataCount = await Event.aggregate([
            {
                $match: {
                    category,
                    status: "Published"
                }
            },
        ]);

        if (data) {
            return res.status(200).json({ success: true, data, count: dataCount.length })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//  get Events Pictures
const getEventsPictures = async (req, res) => {
    let { more } = req.query;
    try {
        let data = [];
        if (more == "true") {
            data = await Event.aggregate([
                {
                    $match: {
                        image: { $exists: true, $ne: null } // Filter documents where the image field exists and is not null
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the _id field
                        image: 1 // Include only the image field
                    }
                }
            ])
        } else {
            data = await Event.aggregate([
                {
                    $match: {
                        image: { $exists: true, $ne: null } // Filter documents where the image field exists and is not null
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the _id field
                        image: 1 // Include only the image field
                    }
                },
                {
                    $limit: 10
                }
            ])
        }

        if (data) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No images found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// get pending events
const getMyLikedEvents = async (req, res) => {
    try {
        let data = await Event.aggregate([
            {
                $match: {
                    "likes": { $elemMatch: { $eq: req.user._id } }
                },
            }
        ]);

        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// get pending events
const getMyEventComments = async (req, res) => {
    try {
        let data = await Comment.find({ addedBy: req.user._id })
            .populate("eventId");

        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getMyUpcomingEvents = async (req, res) => {
    try {
        let events = await TicketReservation.find({ addedBy: req.user._id })
            .populate("eventId");

        let data = [];
        for (const event of events) {
            const dateFromMongoDB = new Date(event?.eventId?.date);
            const timeStr = event?.eventId?.time[1]; // Assuming timeStr is the time string you mentioned: '01:16'
            const datetime = moment(dateFromMongoDB).format('YYYY-MM-DD') + 'T' + timeStr + ':00.000';

            const eventDate = moment(datetime);
            if (eventDate.isAfter(moment())) {
                data.push(event);
            }
        }
        data.sort((a, b) => {
            const dateA = new Date(a.eventId.date);
            const dateB = new Date(b.eventId.date);
            return dateA - dateB;
        });


        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getMyPastEvents = async (req, res) => {
    try {
        let events = await TicketReservation.find({ addedBy: req.user._id })
            .populate("eventId");

        let data = [];
        for (const event of events) {
            const dateFromMongoDB = new Date(event?.eventId?.date);
            const timeStr = event?.eventId?.time[1]; // Assuming timeStr is the time string you mentioned: '01:16'
            const datetime = moment(dateFromMongoDB).format('YYYY-MM-DD') + 'T' + timeStr + ':00.000';

            const eventDate = moment(datetime);
            if (eventDate.isBefore(moment())) {
                data.push(event);
            }
        }
        data.sort((a, b) => {
            const dateA = new Date(a.eventId.date);
            const dateB = new Date(b.eventId.date);
            return dateA - dateB;
        });


        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getOrganizerEventsUsingCategory = async (req, res) => {
    let { category, organizerId } = req.query;
    try {
        const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

        const organizerObjectId = isValidObjectId(organizerId) ? new mongoose.Types.ObjectId(organizerId) : null;

        let data = await Event.find({ addedBy: organizerObjectId, category, status: "Published" })
            .populate("addedBy")
            .sort({ date: 1 });

        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No events found" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message })
    }
}


module.exports = {
    addEvent,
    getMyEvents,
    delEvent,
    getEvent,
    updateEvent,
    getPopularEvents,
    addView,
    addLike,
    addComment,
    getComments,
    deleteComment,
    rejectEventByAdmin,
    publishEventByAdmin,
    getPendingEvents,
    getUpcomingEvents,
    getEventsUsingCategory,
    getEventsPictures,
    getMyLikedEvents,
    getMyEventComments,
    getMyUpcomingEvents,
    getMyPastEvents,
    getOrganizerEventsUsingCategory,
}
