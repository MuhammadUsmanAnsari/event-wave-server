const router = require("express").Router();
const {
    addReservation,
    makePayment,
    getMyBookedSeats,
} = require('../controllers/booking');
const { protect } = require("../middlewares/auth");


// reservation management
router.route("/addReservation")
    .post(protect("organizer", "attendee"), addReservation);

router.route("/mySeats")
    .get(protect("organizer", "attendee"), getMyBookedSeats);
router.route("/make-payment")
    .post(protect("organizer", "attendee"), makePayment);


module.exports = router;