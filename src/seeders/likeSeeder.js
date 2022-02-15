require("../models/Profile");
require("../models/Post");
require("../models/Fan");

const mongoose = require("mongoose");

const Profile = mongoose.model("Profile");
const Post = mongoose.model("Post");
const Fan = mongoose.model("Fan");

async function seedDB() {

    //Set up default mongoose connection
    const mongoDB = "mongodb://127.0.0.1/blogPosts";
    mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

    //Get the default connection
    const db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    // clear table
    //db.collection("fans").drop();

    try {

        // create post likes
        const posts = await Post.find().all().lean();
        const authors = await Profile.find().all().lean();

        posts.map(post  => {

            const random = Math.floor(Math.random() * 10);

            var i = 0;
            for (i=0; i<= random; i++){

                const fan = new Fan({
                    "authorId" : authors[i],
                    "postId" : post._id
                })

                fan.save();
            }
        })

        console.log("created likes");
        console.log("Database seeded! :)");
        process.exit();
    } catch (err) {
        console.log(err.stack);
    }
}

seedDB();
