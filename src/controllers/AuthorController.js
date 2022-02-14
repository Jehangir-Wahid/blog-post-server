const mongoose = require("mongoose");
const logger = require("../helpers/logger");
const {
    generateAuthorsResponse,
    generateAuthorResponse,
} = require("../helpers/generateResponse");
const User = mongoose.model("User");
const Profile = mongoose.model("Profile");
const Post = mongoose.model("Post");
const Fan = mongoose.model("Fan");
const { NotFoundError, ValidationError } = require("../customErrors");
const FileSystem = require("fs");
const path = require("path");

/**
 * Controller Action
 * Delete Author Action with incomplete logic.
 * Implement Mongoose Transactions for rollback on error.
 *
 * @param {http DELETE request} req
 * @param {JSON} res
 * @returns
 */
exports.delete_author = async (req, res) => {
    try {
        const authorId = req.user._id;

        await User.findByIdAndRemove(authorId);
        await Profile.findOneAndRemove(authorId);
        let postsCount = await Post.deleteMany({ authorId });

        return res.status(200).json({
            message: `Account and associated ${postsCount} posts deleted successfully`,
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
 * Get All Authors
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.get_all_authors = async (req, res) => {
    try {
        const authors = await Profile.find().all().lean();
        if (!authors) {
            throw new NotFoundError("No authors found.");
        }

        const authorsData = await generateAuthorsResponse(authors);

        res.status(200).json(authorsData);
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
 * Get Author
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.get_author = async (req, res) => {
    try {
        const authorId = req.params.authorId;

        if (!/^[a-z0-9]{24}$/.test(authorId)) {
            throw new ValidationError(
                `Data validation failed for User ID, value = ${authorId}`
            );
        }

        const author = await Profile.findOne({ authorId }).lean();
        if (!author) {
            throw new NotFoundError("Author not found.");
        }

        const authorData = await generateAuthorResponse(author);

        res.status(200).json(authorData);
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
 * Update Author
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.update_author = async (req, res) => {
    try {
        const { name } = req.body;
        const author_avatar = req.fileName;

        await ValidateSignup({ name, author_avatar });

        const authorId = req.user._id;
        const profile = await Profile.findOne({ authorId });
        if (!profile) {
            throw new NotFoundError("Invalid data.");
        }

        profile.name = name;
        profile.author_avatar = author_avatar;

        await profile.save();
        return res.status(200).json({
            message: "User updated successfully!",
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
 * Get Liked-Posts for the Logged-in user
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.liked_posts = async (req, res) => {
    try {
        const fans = await Fan.find({ author: req.user._id }).select({
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
