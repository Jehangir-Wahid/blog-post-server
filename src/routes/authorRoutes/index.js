const express = require("express");
const router = express.Router();
const requireAuth = require("../../middlewares/requireAuth");
const upload = require("../../middlewares/imageUpload");
const AuthorController = require("../../controllers/AuthorController");

router.delete("/delete", requireAuth, AuthorController.delete_author);

router.get("/all", AuthorController.get_all_authors);

router.get("/:userId", AuthorController.get_author);

router.post(
    "/update-author",
    requireAuth,
    upload.single("author_avatar"),
    AuthorController.update_author
);

router.get("/liked-posts", requireAuth, AuthorController.liked_posts);

module.exports = router;
