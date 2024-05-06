const moment = require('moment');
const Event = require('../models/Event');


const CheckEventStatus = async () => {
    try {
        const currentDate = moment();
        let events = await Event.find({
            status: "Published", isDeleted: false
        })
        for (const event of events) {
            const dateFromMongoDB = new Date(event?.date);
            const timeStr = event?.time[1]; // Assuming timeStr is the time string you mentioned: '01:16'
            const datetime = moment(dateFromMongoDB).format('YYYY-MM-DD') + 'T' + timeStr + ':00.000';

            const eventDate = moment(datetime);


            if (eventDate.isBefore(currentDate)) { // this condition will check that weather arrival time passed or not. if passed then journey_completed=true                
                event.status = "Closed";
                event.save();
            }

        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message })
    }
}
module.exports = CheckEventStatus;
