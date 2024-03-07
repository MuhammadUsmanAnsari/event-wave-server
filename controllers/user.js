const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')

// register new user
const registerUser = asyncHandler(async (req, res) => {
    const { email, firstName, lastName, fullName, idCard, password, role } = req.body
    if (!email || !fullName || (role == "organizer" && !idCard) || !password) {
        return res.status(400).json({ error: "Please add all fields" })
    }
    if (idCard && idCard.length !== 13) {
        return res.status(400).json({ error: "Please add valid ID card number. Only 13 digits are valid" })    
    }

    try {
        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(400).json({ error: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            email,
            firstName,
            lastName,
            fullName,
            idCard,
            role,
            password: hashedPassword,
        })
        let data = {
            email: user.email,
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            idCard: user.idCard,
            role: user.role,
            token: user.getJWToken(),
        }
        if (data) {
            return res.status(200).json({ success: true, data })
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});


// login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user && (await bcrypt.compare(password, user.password))) {
        let jwtoken = user.getJWToken();
        user.isActive = true;
        user.save();

        return res.status(200).json({ success: true, jwtoken })
    } else {
        return res.status(400).json({ error: "Invalid User Data" })
    }
})


// update user
const updateUser = asyncHandler(async (req, res) => {
    const { password, email, name, image } = req.body
    let updatedData;

    if (password && image) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        updatedData = {
            ...req.body,
            password: hashedPassword,
            image
        }
    } else if (password) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        updatedData = {
            ...req.body,
            password: hashedPassword,
        }
    } else if (image) {
        updatedData = {
            ...req.body,
            image
        }
    } else {
        updatedData = { ...req.body }
    }


    const updatedUser = await User.findByIdAndUpdate(req.body._id, updatedData, { new: true })
    if (updatedUser) {
        let data = {
            name: updatedUser.name,
            email: updatedUser.email,
            _id: updatedUser._id,
            image: updatedUser.image,
            token: generateToken(req.body._id)
        }
        res.status(201).json(data)
    } else {
        res.status(400).json({ error: "Invalid User Data" })
    }
})



module.exports = {
    registerUser,
    loginUser,
    updateUser
}
