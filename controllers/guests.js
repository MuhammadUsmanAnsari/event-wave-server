const Event = require('../models/Event');



const getAllGuests = async (req, res) => {
    try {
        const guests = await Event.aggregate([
            { $match: { status: "Published" } },
            { $unwind: "$guests" },
            { $project: { _id: 0, name: "$guests.name", details: "$guests.details", img: "$guests.img", profession: "$guests.profession" } },
            { $sample: { size: 10 } }
        ]);

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
            return res.status(200).json({ success: true, data: result });
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getGuestEvents = async (req, res) => {
    let { name } = req.query;
    try {
        const guests = await Event.aggregate([
            {
                $match: {
                    status: "Published",
                    guests: { $exists: true, $ne: [] }
                }
            },
            { $sort: { "date": 1 } },

            // { $unwind: "$guests" },
            // { $project: { _id: 0, name: "$guests.name", details: "$guests.details", img: "$guests.img", profession: "$guests.profession" } }
        ]);

        import('soundex-code').then(soundex => {
            let result = [];
            guests?.forEach(obj => {
                let speakerExists = obj?.guests?.some((item) => soundex.soundex(item.name) === soundex.soundex(name))
                if (speakerExists) {
                    result.push(obj)
                }
            });
            return res.status(200).json({ success: true, data: result });
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


module.exports = {
    getAllGuests,
    getGuestEvents,
}