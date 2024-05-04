const router = require("express").Router();
const {
    sendContactMsg,
    
} = require('../controllers/contact');
const { protect } = require("../middlewares/auth");


router.route("/")
    .post(protect("organizer", "attendee"), sendContactMsg)



module.exports = router;