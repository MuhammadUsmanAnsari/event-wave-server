const router = require("express").Router();
const {
    getHomePageDetails,

} = require('../controllers/details');
const { protect } = require("../middlewares/auth");


router.route("/homePage")
    .get(getHomePageDetails);



module.exports = router;