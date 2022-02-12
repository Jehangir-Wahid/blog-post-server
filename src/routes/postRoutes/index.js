const express = require("express");
const router = express.Router();
const requireAuth = require("../../middlewares/requireAuth");
const upload = require("../../middlewares/imageUpload");
const PostController = require("../../controllers/PostController");

router.post(
    "/create-post",
    requireAuth,
    upload.single("post_image"),
    PostController.create_post
);

router.get("/all", PostController.get_all_posts);

router.get("/:postId", PostController.get_post);

router.post(
    "/update-post",
    requireAuth,
    upload.single("post_image"),
    PostController.update_post
);

router.get("/self-posts", requireAuth, PostController.get_self_posts);

router.get("/user-posts/:userId", PostController.get_user_posts);

router.delete("/delete", requireAuth, PostController.delete_post);

module.exports = router;
