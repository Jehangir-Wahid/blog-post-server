const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        res.status(429).send({
            message: "Too many requests, please try again later.",
        });
    },
});

module.exports = limiter;
