const mongoose = require("mongoose");
const Profile = mongoose.model("Profile");
const Fan = mongoose.model("Fan");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

exports.generatePostsResponse = async (posts) => {
    const postIds = posts.map((post) => post._id);
    const likedBy = await Fan.find({ postId: { $in: postIds } });

    var likes = 0;
    posts.map((post) => {
        likes = likedBy.filter(
            (item) => item.postId.toString() === post._id.toString()
        );
        post.likes = likes.length;
    });

    const authorIds = posts.map((post) => post.authorId);

    const authors = await Profile.find({
        authorId: { $in: authorIds },
    }).select({ name: 1, author_avatar: 1, authorId: 1 });

    var author = null;
    posts.map((post) => {
        author = authors.filter(
            (item) => item.authorId.toString() === post.authorId.toString()
        );
        post.author_name = author[0].name;
        post.author_avatar = author[0].author_avatar;
    });

    return posts;
};

exports.generatePostResponse = async (post) => {
    post.likes = await Fan.countDocuments({ postId: post._id });

    const author = await Profile.findOne({
        authorId: post.authorId,
    }).select({ name: 1, author_avatar: 1 });

    post.author_name = author.name;
    post.author_avatar = author.author_avatar;

    return post;
};

exports.generateAuthorsResponse = async (authors) => {
    const authorIds = authors.map((author) => author.authorId);
    const posts = await Post.find({ authorId: { $in: authorIds } }).select({
        authorId: 1,
        title: 1,
    });

    var authorPosts = 0;
    authors.map((author) => {
        authorPosts = posts.filter(
            (post) => post.authorId.toString() === author.authorId.toString()
        );
        author.total_posts = authorPosts.length;
    });

    const postIds = posts.map((post) => post._id);
    const likedBy = await Fan.find({ postId: { $in: postIds } });

    var oldValue = 0;
    var newValue = 0;
    authors.map((author) => {
        var postId = "";
        var title = "";
        posts.map((post) => {
            newValue = likedBy.filter(
                (item) =>
                    item.postId.toString() === post._id.toString() &&
                    author.authorId.toString() === post.authorId.toString()
            ).length;
            if (newValue > oldValue) {
                postId = post._id;
                title = post.title;
            }
        });
        author.popular_post_id = postId;
        author.popular_post_name = title;
    });

    return authors;
};

exports.generateAuthorResponse = async (author) => {
    const user = await User.findById(author.authorId).select({
        _id: 0,
        username: 1,
    });
    author.username = user.username;

    const posts = await Post.find({ authorId: author.authorId }).select({
        authorId: 1,
        title: 1,
    });
    author.total_posts = posts.length;

    const postIds = posts.map((post) => post._id);
    const likedBy = await Fan.find({ postId: { $in: postIds } });
    author.total_likes = likedBy.length;

    var oldValue = 0;
    var newValue = 0;
    posts.map((post) => {
        newValue = likedBy.filter(
            (item) => item.postId.toString() === post._id.toString()
        ).length;
        if (newValue > oldValue) {
            author.popular_post_id = post._id;
            author.popular_post_name = post.title;
            author.popular_post_likes = newValue;
        }
    });

    return author;
};
