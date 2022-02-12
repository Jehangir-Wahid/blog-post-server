const express = require("express");
const router = express.Router();
const requireAuth = require("../../middlewares/requireAuth");
const FanController = require("../../controllers/FanController");

router.post("/like-post", requireAuth, FanController.like_post);

router.get("/liked-posts/:userId", FanController.liked_posts);

module.exports = router;
