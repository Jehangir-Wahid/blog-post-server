// const mongoose = require("mongoose");
// const { faker } = require("@faker-js/faker");

// const User = mongoose.model("User");
// const Profile = mongoose.model("Profile");
// const Post = mongoose.model("Post");
// const Fan = mongoose.model("Fan");

// exports.users = async (req, res) => {
//     var i = 0;
//     for (i = 0; i < 10; i++) {
//         const name = faker.name.findName();
//         const img = faker.image.avatar();
//         const email = faker.internet.email(name);
//         const password = "maigey";

//         const user = new User({
//             username: email,
//             password: password,
//         });
//         user.save();

//         const profile = new Profile({
//             authorId: user._id,
//             name: name,
//             author_avatar: img,
//         });

//         profile.save();
//     }

//     return res.json({ success: true });
// };

// exports.posts = async (req, res) => {
//     const authors = await Profile.find().all().lean();

//     authors.map((author) => {
//         var i = 0;
//         for (i = 0; i < 5; i++) {
//             const sentence = faker.lorem.sentence(10);
//             const tags = sentence.split(" ");

//             const post = new Post({
//                 authorId: author.authorId,
//                 title: sentence,
//                 content: faker.lorem.lines(3),
//                 post_image: faker.image.avatar(),
//                 tag: tags[0],
//             });

//             post.save();
//         }
//     });

//     return res.json(authors);
// };

// exports.likes = async (req, res) => {
//     const posts = await Post.find().all().lean();
//     const authors = await Profile.find().all().lean();

//     posts.map((post) => {
//         const random = Math.floor(Math.random() * 10);

//         var i = 0;
//         for (i = 0; i <= random; i++) {
//             const fan = new Fan({
//                 authorId: authors[i],
//                 postId: post._id,
//             });

//             fan.save();
//         }
//     });

//     return res.json({ success: true });
// };
