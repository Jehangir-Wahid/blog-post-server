const mongoose = require("mongoose");
const logger = require("../helpers/logger");
const { ValidatePost } = require("../helpers/validations");
const {
    generatePostsResponse,
    generatePostResponse,
} = require("../helpers/generateResponse");
const Post = mongoose.model("Post");
const User = mongoose.model("User");
const Fan = mongoose.model("Fan");
const {
    ValidationError,
    AlreadyExistError,
    InvalidDataError,
    NotFoundError,
} = require("../customErrors");
const FileSystem = require("fs");
const path = require("path");
/**
 * Controller Action
 * Create Post
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.create_post = async (req, res) => {
    try {
        const { title, content, tag } = req.body;
        const post_image = req.body.post_image; // req.fileName;

        await ValidatePost({ title, content, post_image, tag });

        const authorId = req.user._id;

        const isUserExist = await User.findById({ _id: authorId });
        if (!isUserExist) {
            throw new InvalidDataError("Author does not exists.");
        }

        const isPostExist = await Post.findOne({ title });
        if (isPostExist) {
            throw new AlreadyExistError("Post already exists.");
        }

        const post = new Post({
            authorId,
            title,
            content,
            post_image,
            tag,
        });
        await post.save();
        res.status(200).json({ message: "Post created Successfully" });
    } catch (error) {
        // FileSystem.unlinkSync(
        //     path.join(
        //         __dirname,
        //         "../public/images/" + req.folderName + "/" + req.fileName
        //     )
        // );
        let message = error.message;
        logger.error(error.stack);

        if (
            error instanceof ValidationError ||
            error instanceof AlreadyExistError
        ) {
            res.status(422);
        } else if (error instanceof InvalidDataError) {
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
 * Get All Posts
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.get_all_posts = async (req, res) => {
    try {
        const posts = await Post.find().all().lean();
        if (posts.length === 0) {
            throw new NotFoundError("No posts found.");
        }

        const postsData = await generatePostsResponse(posts);

        res.status(200).json(postsData);
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

/**
 * Controller Action
 * Get Post by ID
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.get_post = async (req, res) => {
    try {
        const postId = req.params.postId;

        if (!/^[a-z0-9]{24}$/.test(postId)) {
            throw new ValidationError(
                `Data validation failed for Post ID, value = ${postId}}`
            );
        }

        const post = await Post.findById(postId).lean();
        if (!post) {
            throw new NotFoundError("Post not found.");
        }

        const postData = await generatePostResponse(post);

        res.status(200).json(postData);
    } catch (error) {
        let message = error.message;
        logger.error(error.stack);

        if (error instanceof ValidationError) {
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
 * Update Post
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.update_post = async (req, res) => {
    try {
        const { _id, title, content, tag } = req.body;
        const post_image = req.fileName;

        await ValidatePost({ title, content, post_image, tag });

        const post = await Post.findById(_id);
        if (!post) {
            throw new NotFoundError("Invalid data.");
        }

        post.title = title;
        post.content = content;
        post.post_image = post_image;
        post.tag = tag;

        await post.save();
        return res.status(200).json({
            message: "Post updated successfully!",
        });
    } catch (error) {
        FileSystem.unlinkSync(
            path.join(
                __dirname,
                "../public/images/" + req.folderName + "/" + req.fileName
            )
        );
        let message = error.message;
        logger.error(error.stack);

        if (error instanceof NotFoundError) {
            res.status(404);
        } else if (error instanceof ValidationError) {
            res.status(422);
        } else {
            res.status(500);
            message = "Internal server error, please try again later.";
        }

        return res.json({ message });
    }
};

/**
 * Controller Action
 * Get all Posts for Logged-in user
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.get_self_posts = async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.user._id }).lean();
        if (posts.length === 0) {
            throw new NotFoundError("No posts found.");
        }

        const postsData = await generatePostsResponse(posts);

        res.status(200).json(postsData);
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

/**
 * Controller Action
 * Get all Posts for an Author
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.get_user_posts = async (req, res) => {
    try {
        const posts = await Post.find({ authorId: req.params.authorId }).lean();
        if (posts.length === 0) {
            throw new NotFoundError("No posts found.");
        }

        const postsData = await generatePostsResponse(posts);

        res.status(200).json(postsData);
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

/**
 * Controller Action
 * Delete Post Action with incomplete logic.
 * Implement Mongoose Transactions for rollback on error.
 *
 * @param {http DELETE request} req
 * @param {JSON} res
 * @returns
 */
exports.delete_post = async (req, res) => {
    try {
        const postId = req.params.postId;

        await Post.findByIdAndRemove(postId);
        let likesCount = await Fan.deleteMany({ postId });

        return res.status(200).json({
            message: `Post and associated ${likesCount} likes deleted successfully`,
        });
    } catch (error) {
        logger.error(error.stack);

        return res.status(500).json({
            message: "Internal server error, please try again later.",
        });
    }
};

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

        const isFanExists = await Fan.findOne({ authorId, postId });
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

        if (fans.length === 0) {
            throw new NotFoundError("No posts found.");
        }

        const postIds = fans.map((fan) => {
            return fan.postId;
        });
        const likedPosts = await Post.find({ _id: { $in: postIds } }).lean();

        if (likedPosts.length === 0) {
            throw new NotFoundError("No posts found.");
        }

        const postsData = await generatePostsResponse(likedPosts);

        res.status(200).json(postsData);
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
