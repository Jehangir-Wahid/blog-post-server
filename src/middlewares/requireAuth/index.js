const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: "You must be logged-in." });
    }

    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.SECRET_TOKEN, async (err, payload) => {
        if (err) {
            return res
                .status(401)
                .json({ message: `You must be logged-in to proceed.` });
        }

        const { authorId } = payload;
        if (authorId) {
            const user = await User.findById(authorId);
            req.user = user;
        }
        next();
    });
};
