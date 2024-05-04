const router = require("express").Router();
const {
    addBlog,
    updateBlog,
    getMyBlogs,
    getBlog,
} = require('../controllers/blog');
const { protect } = require("../middlewares/auth");


router.route("/")
    .post(protect("organizer", "admin"), addBlog)
    .put(protect("organizer", "admin"), updateBlog)
    .get(protect("organizer", "admin"), getBlog);

router.route("/getMyBlogs")
    .get(protect("organizer", "admin"), getMyBlogs);


module.exports = router;