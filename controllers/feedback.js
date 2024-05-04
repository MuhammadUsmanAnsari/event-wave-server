const Feedback = require('../models/Feedback');

const getFeedbacks = async (req, res) => {
    let { limit } = req.query;
    try {
        limit = parseInt(limit);
        let data = await Feedback.find()
            .populate("addedBy")
            .sort({ createdAt: -1 })
            .limit({ limit });


        return res.status(200).json({ success: true, data })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const addFeedback = async (req, res) => {
    try {
        let body = req.body;
        body.addedBy = req.user._id;
        let data = await Feedback.create(body);
        if (data) {
            return res.status(200).json({ success: false, msg: "Feedback added successfully!" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    getFeedbacks,
    addFeedback,
}