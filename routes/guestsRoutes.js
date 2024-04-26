const router = require("express").Router();
const {
    getAllGuests,
    getGuestEvents,

} = require('../controllers/guests');
const { protect } = require("../middlewares/auth");


// event speakers
router.route("/getAll")
    .get(getAllGuests);
// event speakers
router.route("/guestEvents")
    .get(protect("organizer", "attendee", "admin"), getGuestEvents);



module.exports = router;