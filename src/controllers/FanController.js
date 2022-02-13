const mongoose = require("mongoose");
const logger = require("../helpers/logger");
const {
    NotFoundError,
    ValidationError,
    AlreadyExistError,
} = require("../customErrors");
const Post = mongoose.model("Post");
const Fan = mongoose.model("Fan");

/**
 * Controller Action
 * Like or Unlike a Post
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.like_post = async (req, res) => {
    try {
        // await preventDOS(req.session, "likePostRetriesCount");

        const { postId, isLike } = req.body;

        if (!/^[a-z0-9]{24}$/.test(postId)) {
            throw new ValidationError(
                `Data validation failed for Post ID, value = ${postId}}`
            );
        }

        const isPostExists = await Post.findOne({ _id: postId });
        if (!isPostExists) {
            throw new NotFoundError("Post not found.");
        }

        const authorId = req.user._id;

        const isFanExists = await Fan.findOne({
            authorId,
            postId,
        });
        if (isLike) {
            if (isFanExists) {
                throw new AlreadyExistError("You've already liked this post.");
            } else {
                const fan = new Fan({ authorId, postId });
                fan.save();
            }
        } else {
            if (!isFanExists) {
                throw new NotFoundError("You have'nt liked this post yet.");
            } else {
                await Fan.findOneAndRemove({ authorId });
            }
        }

        res.status(200).json({
            message:
                "Post " + (isLike ? "liked" : "unliked") + " successfully!",
        });
    } catch (error) {
        let message = error.message;
        logger.error(error.stack);

        if (
            error instanceof ValidationError ||
            error instanceof AlreadyExistError
        ) {
            res.status(422);
        } else if (error instanceof NotFoundError) {
            res.status(404);
        } else {
            res.status(500);
            message = "Internal server error, please try again later.";
        }

        return res.json({ message });
    }
};

/**
 * Controller Action
 * Get Liked-Posts for an Author
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.liked_posts = async (req, res) => {
    try {
        const fans = await Fan.find({ authorId: req.params.authorId }).select({
            _id: 0,
            postId: 1,
        });
        const postIds = fans.map((fan) => {
            return fan.postId;
        });
        const likedPosts = await Post.find({ _id: { $in: postIds } });

        if (likedPosts.length === 0) {
            throw new NotFoundError("No posts found.");
        }

        res.status(200).json({ likedPosts });
    } catch (error) {
        let message = error.message;
        logger.error(error.stack);

        if (error instanceof NotFoundError) {
            res.status(404);
        } else {
            res.status(500);
            message = "Internal server error, please try again later.";
        }

        return res.json({ message });
    }
};
