const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    tag: {
        type: String,
        required: false,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

mongoose.model("Post", postSchema);
