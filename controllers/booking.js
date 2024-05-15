
const Event = require('../models/Event');
const TicketReservation = require('../models/TicketReservation');
const moment = require('moment');


// add Reservation 
const addReservation = async (req, res) => {
    let { id } = req.query;

    try {
        let event = await Event.findById(id)
        const bookedSeats = event?.seatsBooked?.reduce((acc, currentItem) => acc + currentItem.seats, 0);

        if (event && event.seats > bookedSeats && event.status === "Published") {
            const currentDateAndTime = moment();
            const dateFromMongoDB = new Date(event?.date);
            const timeStr = event?.time[0];
            // const dateTimeFromEntry = moment(`${event?.date} ${event?.time[0]}`, 'YYYY-MM-DD HH:mm'); // Example date and time, replace it with your entry
            const dateTimeFromEntry = moment(dateFromMongoDB).format('YYYY-MM-DD') + 'T' + timeStr + ':00.000';
            const eventDate = moment(dateTimeFromEntry);

            // Compare the dates
            const isInFuture = eventDate.isAfter(currentDateAndTime);
            if (!isInFuture) {
                return res.status(400).json({ success: false, message: "You can't book this event because event is started already." })
            }

            let body = {
                ...req.body,
                addedBy: req.user._id,
                eventId: id,
            }

            let alreadyBooked = event?.seatsBooked?.some(item => item.addedBy.toString() === req.user._id.toString());
            if (alreadyBooked) {
                let reservation = await TicketReservation.create(body);
                let previousReservations = await TicketReservation.find({
                    addedBy: req.user._id,
                    eventId: event?._id
                })
                const totalQuantity = previousReservations?.reduce((acc, currentItem) => acc + currentItem.quantity, 0);

                let matchedTicketInfo = event?.seatsBooked?.find(item => item.addedBy.toString() === req.user._id.toString());
                if (matchedTicketInfo) {
                    matchedTicketInfo.reservation?.push(reservation?._id);
                    matchedTicketInfo.seats = totalQuantity;
                }

                let eventUpdated = await Event.findOneAndUpdate(
                    { _id: id, 'seatsBooked.addedBy': req.user._id },
                    { $set: { 'seatsBooked.$': matchedTicketInfo } },
                    { new: true }
                );

                return res.status(200).json({ success: true, msg: `${reservation?.quantity > 1 ? "Tickets" : "Ticket"} reserved successfully!` })
                // return res.status(200).json({ success: true, msg: `reserved successfully!` })
            } else {
                let reservation = await TicketReservation.create(body);
                let eventSeatsBooked = {
                    reservation: [reservation?._id],
                    seats: reservation?.quantity,
                    addedBy: req.user._id
                }
                event?.seatsBooked?.push(eventSeatsBooked);
                await event.save();
                return res.status(200).json({ success: true, msg: `${reservation?.quantity > 1 ? "Tickets" : "Ticket"} reserved successfully!` })
            }

        } else if (event && event.seats <= bookedSeats && event.status === "Published") {
            return res.status(400).json({ success: false, message: "More seats not available. All tickets sold out" })
        } else if (event.status !== "Published") {
            return res.status(400).json({ success: false, message: "This evnet is not published right now" })
        } else {
            return res.status(404).json({ success: false, message: "Event not found" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}



const getMyBookedSeats = async (req, res) => {
    let { id } = req.query;
    try {
        let reservations = await TicketReservation.find({
            addedBy: req.user._id,
            eventId: id
        });
        return res.status(200).json({ success: true, data: reservations })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message })
    }
}
module.exports = {
    addReservation,
    getMyBookedSeats,
}