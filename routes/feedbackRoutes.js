const router = require("express").Router();
const {
    getFeedbacks,
    addFeedback,
} = require('../controllers/feedback');
const { protect } = require("../middlewares/auth");


router.route("/")
    .post(protect("organizer", "attendee"), addFeedback)
    .get(getFeedbacks);



module.exports = router;