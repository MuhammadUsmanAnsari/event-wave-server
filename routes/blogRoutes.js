const router = require("express").Router();
const {
    addBlog,
    updateBlog,
    getMyBlogs,
    getBlog,
    delBlog,
    getLatestBlogs,
    getTopLatestBlogs,
    addView,
    addLike,
    getComments,
    addComment,
    deleteComment,
    getMyLikedBlogs,
    getMyBlogComments,
} = require('../controllers/blog');
const { protect } = require("../middlewares/auth");


router.route("/")
    .post(protect("organizer", "admin"), addBlog)
    .put(protect("organizer", "admin"), updateBlog)
    .get(protect("organizer", "admin", "attendee"), getBlog)
    .delete(protect("organizer", "admin"), delBlog);

router.route("/getMyBlogs")
    .get(protect("organizer", "admin"), getMyBlogs);

router.route("/getLatestBlogs")
    .get(protect("organizer", "admin", "attendee"), getLatestBlogs);

router.route("/getTopLatestBlogs")
    .get(getTopLatestBlogs);


router.route("/addView")
    .put(protect("organizer", "attendee"), addView);
router.route("/addLike")
    .put(protect("organizer", "attendee"), addLike);
router.route("/comment")
    .post(protect("organizer", "attendee"), addComment)
    .get(protect("organizer", "attendee"), getComments)
    .delete(protect("organizer", "attendee"), deleteComment);

router.route("/getMyLikedBlogs")
    .get(protect("organizer", "attendee"), getMyLikedBlogs);
router.route("/getMyBlogComments")
    .get(protect("organizer", "attendee"), getMyBlogComments);



module.exports = router;