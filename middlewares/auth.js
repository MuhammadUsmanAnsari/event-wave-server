const trycatch = require('./tryCatch');
const jwt = require("jsonwebtoken");
const User = require('../models/User')

module.exports.protect = (...roles) => trycatch(async (req, res, next) => {
    const jwtoken = req.headers.jwtoken;
    const { id, role } = await jwt.verify(jwtoken, process.env.JWT_SECRET);
    if (roles.includes(role)) {
        const user = await User.findOne({ _id: id, role });
        if (!user || !user.isActive) return res.status(401).json({ authorized: false });
        req.user = user;
        next();

    } else {
        return res.status(403).json({ permission: false });
    }
});
