const User = require('../models/User');
const Contact = require('../models/Contact');
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


const sendContactMsg = async (req, res) => {
    let { email, subject, name, phone, message } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this email." })
        }

        const mailOptions = {
            from: {
                name: "Event Wave",
                address: process.env.AUTH_EMAIL,
            },
            to: process.env.AUTH_EMAIL,
            subject: subject,
            html: `<p>
                    We recieved this email from EventWave contact form.
                        <br />
                        <div>                        
                            <b>User Name:</b> ${name}                    
                        </div>                        
                        <div>                        
                            <b>User Email:</b> ${email}                    
                        </div>                        
                        <div>                        
                            <b>Phone:</b> ${phone}                    
                        </div>                        
                        <div>                        
                            <b>Subject:</b> ${subject}                    
                        </div>                        
                        <div>                        
                            <b>Message:</b> ${message}                    
                        </div>                        
                    </p>                                    
                    `
        };
        await transporter.sendMail(mailOptions);
        let bodyDate = { ...req.body, addedBy: req.user._id }
        let contact = await Contact.create(bodyDate)

        return res.status(200).json({ success: true, msg: "Sent Successfully!" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    sendContactMsg,
}