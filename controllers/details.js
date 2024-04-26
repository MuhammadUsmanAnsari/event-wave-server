const Event = require('../models/Event');
const User = require('../models/User');
const TicketReservation = require('../models/TicketReservation');



const getHomePageDetails = async (req, res) => {
    try {
        // getting guests
        const guests = await Event.aggregate([
            { $match: { status: { $in: ["Published", "Closed"] } } },
            { $unwind: "$guests" },
            { $project: { _id: 0, name: "$guests.name" } }
        ]);

        // getting events
        const events = await Event.countDocuments()

        // getting users
        const users = await User.find({ role: { $ne: "admin" } });

        // getting sold tickets
        const sumResult = await TicketReservation.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: "$quantity" }
                }
            }
        ]);
        const soldTickets = sumResult.length > 0 ? sumResult[0].totalQuantity : 0;


        import('soundex-code').then(soundex => {
            const result = [];
            const soundexMap = [];
            guests.forEach(obj => {
                const name = obj.name;
                const soundexCode = soundex.soundex(name);
                // If the Soundex code already exists in the map, skip this object
                if (soundexMap[soundexCode]) {
                    return;
                }

                // Add the Soundex code to the map and add the object to the result array
                soundexMap[soundexCode] = true;
                result.push(obj);
            });

            let data = {
                guests: result.length,
                events,
                users: users.length,
                soldTickets
            }
            return res.status(200).json({ success: true, data });
        })


    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


module.exports = {
    getHomePageDetails,
}