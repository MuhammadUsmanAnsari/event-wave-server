const router = require("express").Router();
const {
    addEvent,
    uploadedImage,
    getMyEvents,
    delEvent,
    getEditEvent,
} = require('../controllers/events');
const { protect } = require("../middlewares/auth");


// event management
router.route("/add")
    .post(protect("organizer"), addEvent);

router.route("/uploadImage")
    .post(protect("organizer"), uploadedImage);

router.route("/getMyEvents")
    .get(protect("organizer"), getMyEvents);

router.route("/")
    .delete(protect("organizer"), delEvent)
    .get(protect("organizer"), getEditEvent);

// router.route("/updateUserPassword")
//     .put(protect("organizer", "attendee"), updateUserPassword);

// router.route("/uploadImage")
//     .post(protect("organizer", "attendee"), uploaded);




module.exports = router;