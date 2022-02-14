const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const logger = require("../helpers/logger");
const { ValidateSignup, ValidateSignin } = require("../helpers/validations");
const User = mongoose.model("User");
const Profile = mongoose.model("Profile");
const {
    NotFoundError,
    ValidationError,
    AlreadyExistError,
    InvalidDataError,
} = require("../customErrors");
const FileSystem = require("fs");
const path = require("path");

/**
 * Controller Action
 * Sign-up Action with incomplete logic.
 * Implement Mongoose Transactions for rollback on error.
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.sign_up = async (req, res) => {
    const { username, password, name } = req.body;
    const author_avatar = req.fileName;

    try {
        await ValidateSignin({ username, password });
        await ValidateSignup({ name, author_avatar });

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new AlreadyExistError("User already exists");
        }

        const user = new User({ username, password });
        user.save()
            .then((item) => {
                const profile = new Profile({
                    authorId: item._id,
                    name,
                    author_avatar:
                        process.env.HOST_URL +
                        "/images/author/" +
                        author_avatar,
                });
                profile
                    .save()
                    .then(() => {
                        const token = jwt.sign(
                            { authorId: user._id },
                            process.env.SECRET_TOKEN
                        );
                        return res.status(200).json({
                            token,
                            message: "User Signed Up successfully!",
                        });
                    })
                    .catch(async (error) => {
                        logger.error(error.stack);
                        FileSystem.unlinkSync(
                            path.join(
                                __dirname,
                                "../public/images/" +
                                    req.folderName +
                                    "/" +
                                    req.fileName
                            )
                        );

                        await user.deleteOne({ _id: user._id });
                        await profile.deleteOne({ _id: profile._id });

                        return res.status(500).json({
                            message:
                                "Internal server error, please try again later.",
                        });
                    });
            })
            .catch(async (error) => {
                logger.error(error.stack);

                FileSystem.unlinkSync(
                    path.join(
                        __dirname,
                        "../public/images/" +
                            req.folderName +
                            "/" +
                            req.fileName
                    )
                );

                await user.deleteOne({ _id: user._id });

                return res.status(500).json({
                    message: "Internal server error, please try again later.",
                });
            });
    } catch (error) {
        logger.error(error.stack);

        FileSystem.unlinkSync(
            path.join(
                __dirname,
                "../public/images/" + req.folderName + "/" + req.fileName
            )
        );

        let message = error.message;

        if (
            error instanceof ValidationError ||
            error instanceof AlreadyExistError
        ) {
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
 * Sign-in
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.sign_in = async (req, res) => {
    try {
        await ValidateSignin(req.body);

        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        user.comparePassword(password)
            .then(() => {
                const token = jwt.sign(
                    { authorId: user._id },
                    process.env.SECRET_TOKEN
                );
                // res.redirect("/author/")
                res.status(200).json({
                    token,
                    message: "Successfully Authenticated",
                });
            })
            .catch((error) => {
                return res.status(422).json({ message: error });
            });
    } catch (error) {
        let message = error.message;
        logger.error(error.stack);

        if (error instanceof NotFoundError) {
            res.status(404);
        } else if (
            error instanceof ValidationError ||
            error instanceof InvalidDataError
        ) {
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
 * Sign-out
 *
 * @param {http GET request} req
 * @param {JSON} res
 * @returns
 */
exports.sign_out = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        logger.error(error.stack);

        return res.status(500).json({
            message: "Internal server error, please try again later.",
        });
    }
};

/**
 * Controller Action
 * Update Password
 *
 * @param {http POST request} req
 * @param {JSON} res
 * @returns
 */
exports.update_password = async (req, res) => {
    try {
        const { password } = req.body;
        if (!/^[a-zA-Z0-9\.\_\!\@\#\$\%\&\*\']{8,30}$/.test(password)) {
            throw new ValidationError(
                `Data validation failed for Password, value = ${password}}`
            );
        }

        const authorId = req.user._id;
        const user = await User.findById(authorId);
        if (!user) {
            throw new NotFoundError("User not found.");
        }

        user.password = password;

        await user.save();
        return res.status(200).json({
            message: "User updated successfully!",
        });
    } catch (error) {
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
