const router = require("express").Router();
const {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    getUser,
} = require('../controllers/user');
const { protect } = require("../middlewares/auth");


router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verifyOTP', verifyOTP)
router.post('/resendOTP', resendOTP)
router.post('/forgotPassword', forgotPassword)
router.put('/resetPassword', resetPassword)
router.route("/getUser")
    .get(protect("organizer", "attendee"), getUser);


module.exports = router;