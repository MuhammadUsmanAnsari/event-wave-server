const router = require("express").Router();
const {
    addReservation,
    getMyBookedSeats,
} = require('../controllers/booking');
const { protect } = require("../middlewares/auth");


// reservation management
router.route("/addReservation")
    .post(protect("organizer", "attendee"), addReservation);

router.route("/mySeats")
    .get(protect("organizer", "attendee"), getMyBookedSeats);


module.exports = router;