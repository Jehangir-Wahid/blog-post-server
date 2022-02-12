const mongoose = require("mongoose");

const fanSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: "Post",
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

mongoose.model("Fan", fanSchema);
