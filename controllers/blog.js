const CommentBlog = require('../models/CommentBlogs');
const Blog = require('../models/Blog');
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    }
});


const addBlog = async (req, res) => {
    let bodyData = req.body;
    try {
        if (!bodyData.title || !bodyData.category || !bodyData.description) {
            return res.status(400).json({ success: false, message: "title, category and description are required." })
        }
        let body = { ...bodyData, addedBy: req.user._id }
        let blog = await Blog.create(body);
        // if (req?.user?.followers?.length > 1) {

        // }

        if (blog) {
            return res.status(200).json({ success: true, msg: "Your blog is published.", blog });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }




    // const mailOptions = {
    //     from: {
    //         name: "Event Wave",
    //         address: process.env.AUTH_EMAIL,
    //     },
    //     to: process.env.AUTH_EMAIL,
    //     subject: subject,
    //     html: `<p>
    //                 We recieved this email from EventWave contact form.
    //                     <br />
    //                     <div>                        
    //                         <b>User Name:</b> ${name}                    
    //                     </div>                        
    //                     <div>                        
    //                         <b>User Email:</b> ${email}                    
    //                     </div>                        
    //                     <div>                        
    //                         <b>Phone:</b> ${phone}                    
    //                     </div>                        
    //                     <div>                        
    //                         <b>Subject:</b> ${subject}                    
    //                     </div>                        
    //                     <div>                        
    //                         <b>Message:</b> ${message}                    
    //                     </div>                        
    //                 </p>                                    
    //                 `
    // };
    // await transporter.sendMail(mailOptions);
}

const getMyBlogs = async (req, res) => {
    try {
        let data = await Blog.find({
            $and: [
                { addedBy: req.user._id },
                { status: { $ne: "Deleted" } }
            ]
        })
            .sort({ createdAt: -1 });
        if (data) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No blogs found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}



//edit event 
const updateBlog = async (req, res) => {
    let { id } = req.query;
    try {
        let body = req.body;
        let blog = await Blog.findByIdAndUpdate(id, body, { new: true });
        if (blog) {
            return res.status(200).json({ success: true, msg: "Blog Updated successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "No blog found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//get edit event 
const getBlog = async (req, res) => {
    let { id } = req.query;
    try {
        let blog = await Blog.findById(id)
            .populate("addedBy",);
        if (blog) {
            return res.status(200).json({ success: true, data: blog })
        } else {
            return res.status(404).json({ success: false, message: "No blog found" })
        }
    } catch (error) {
        console.log('checking=>', error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

//del blog 
const delBlog = async (req, res) => {
    let { id } = req.query;
    try {
        let blog = await Blog.findById(id);
        if (blog) {
            blog.status = "Deleted";
            await blog.save();
            return res.status(200).json({ success: true, msg: "Blog deleted successfully!" })
        }
    } catch (error) {
        console.log('checking=>', error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

//del blog 
const getLatestBlogs = async (req, res) => {
    let { limit, page } = req.query;
    if (!limit) limit = 10;
    if (!page) page = 1;
    limit = parseInt(limit);
    let skip = limit * (page - 1);

    try {
        let data = await Blog.find({ status: "Published" })
            .populate("addedBy")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        let dataCount = await Blog.countDocuments();

        if (data) {
            return res.status(200).json({ success: true, data, count: dataCount })
        } else {
            return res.status(400).json({ success: false, message: "No blogs found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


const getTopLatestBlogs = async (req, res) => {
    try {
        let data = await Blog.find({ status: "Published" })
            .populate("addedBy")
            .sort({ createdAt: -1 })
            .limit(8);

        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No blogs found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}



// add view in blog
const addView = async (req, res) => {
    const { id } = req.query;
    try {
        const blog = await Blog.findById(id);

        if (blog) {
            let checkView = blog?.views?.some(item => item.equals(req.user._id));
            if (!checkView) {
                blog.views.push(req?.user?._id);
                blog.save()
                return res.status(200).json({ success: true, })
            }
        } else {
            return res.status(404).json({ success: false, })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

const addLike = async (req, res) => {
    const { id } = req.query;
    try {
        const blog = await Blog.findById(id);

        if (blog) {
            let checkLike = blog?.likes?.some(item => item.equals(req.user._id));
            if (!checkLike) {
                blog.likes.push(req?.user?._id);
                await blog.save()
                return res.status(200).json({ success: true, msg: "Blog liked successfully!" })
            } else {
                let filtered = blog?.likes?.filter(item => item.toString() !== req.user._id.toString());
                blog.likes = filtered;
                await blog.save()
                return res.status(200).json({ success: true, msg: "Blog disliked successfully!" })
            }
        } else {
            return res.status(404).json({ success: false, message: "Blog not exists" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

const getComments = async (req, res) => {
    let { limit, page, id } = req.query;
    if (!limit) limit = 10;
    if (!page) page = 1;
    limit = parseInt(limit);
    let skip = limit * (page - 1);

    try {
        const comments = await CommentBlog.find({ blogId: id })
            .populate("addedBy blogId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const commentsCount = await CommentBlog.find({ blogId: id });

        return res.status(200).json({ success: true, data: comments, count: commentsCount.length })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

// add addComment in event
const addComment = async (req, res) => {
    const { id } = req.query;
    try {
        const blog = await Blog.findById(id);

        if (blog) {
            let body = { ...req.body, addedBy: req.user._id, blogId: blog?._id }
            const comment = await CommentBlog.create(body);
            blog.comments.push(comment?._id);
            await blog.save()
            return res.status(200).json({ success: true, msg: "Comment added successfully!" })
        } else {
            return res.status(404).json({ success: false, message: "Blog not exists" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}

const deleteComment = async (req, res) => {
    let { id } = req.query;

    try {
        const comment = await CommentBlog.findById(id);

        if (comment) {
            if (comment?.addedBy.toString() == req.user._id.toString()) {
                let blog = await Blog.findById(comment?.blogId);
                let filtered = blog?.comments?.filter(item => !item.equals(id));
                blog.comments = filtered;
                await blog.save();
                await CommentBlog.findByIdAndDelete(id)
                return res.status(200).json({ success: true, msg: "Comment deleted successfully!" })
            } else {
                return res.status(404).json({ success: false, message: "You can delete your own comments." })
            }
        } else {
            return res.status(404).json({ success: false, message: "No comment found" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal server error. Please try again later." })
    }
}


const getMyLikedBlogs = async (req, res) => {
    try {
        let data = await Blog.aggregate([
            {
                $match: {
                    "likes": { $elemMatch: { $eq: req.user._id } }
                },
            }
        ]);
        console.log(data);
        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No blogs found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const getMyBlogComments = async (req, res) => {
    try {
        let data = await CommentBlog.find({ addedBy: req.user._id })
            .populate("blogId");

        if (data.length > 0) {
            return res.status(200).json({ success: true, data })
        } else {
            return res.status(400).json({ success: false, message: "No blogs found" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    addBlog,
    getMyBlogs,
    updateBlog,
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
}