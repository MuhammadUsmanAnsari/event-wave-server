const router = require("express").Router();
const {
    addEvent,
    getMyEvents,
    delEvent,
    getEvent,
    updateEvent,
    getPopularEvents,
    addView,
    addLike,
    addComment,
    getComments,
    deleteComment,
    rejectEventByAdmin,
    publishEventByAdmin,
    getPendingEvents,
    getUpcomingEvents,
    getEventsUsingCategory,
    getEventsPictures,
} = require('../controllers/events');
const { protect } = require("../middlewares/auth");


// event management
router.route("/add")
    .post(protect("organizer"), addEvent);

router.route("/getMyEvents")
    .get(protect("organizer"), getMyEvents);

router.route("/")
    .delete(protect("organizer", "admin"), delEvent)
    .get(protect("organizer", "attendee", "admin"), getEvent)
    .put(protect("organizer", "admin"), updateEvent);

router.route("/popular/:type")
    .get(getPopularEvents);

router.route("/addView")
    .put(protect("organizer", "attendee"), addView);
router.route("/addLike")
    .put(protect("organizer", "attendee"), addLike);
router.route("/upcoming")
    .get(protect("organizer", "attendee", "admin"), getUpcomingEvents);
router.route("/category")
    .get(protect("organizer", "attendee", "admin"), getEventsUsingCategory);
router.route("/gallery")
    .get(protect("organizer", "attendee", "admin"), getEventsPictures);

router.route("/comment")
    .post(protect("organizer", "attendee"), addComment)
    .get(protect("organizer", "attendee"), getComments)
    .delete(protect("organizer", "attendee"), deleteComment);

// admin routes
router.route("/rejectEventByAdmin")
    .delete(protect("admin"), rejectEventByAdmin);

router.route("/publishEventByAdmin")
    .put(protect("admin"), publishEventByAdmin);

router.route("/getPendingEvents")
    .get(protect("admin"), getPendingEvents);




module.exports = router;