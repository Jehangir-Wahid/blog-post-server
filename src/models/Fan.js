const mongoose = require("mongoose");

const fanSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    postId: {
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
