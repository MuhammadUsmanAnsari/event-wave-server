const User = require('../models/User');
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
        let event = await Blog.findById(id)
            .populate("addedBy",);
        if (event) {
            return res.status(200).json({ success: true, data: event })
        } else {
            return res.status(404).json({ success: false, message: "No blog found" })
        }
    } catch (error) {
        console.log('checking=>', error);
        return res.status(500).json({ success: false, message: error.message })
    }
}
module.exports = {
    addBlog,
    getMyBlogs,
    updateBlog,
    getBlog,
}