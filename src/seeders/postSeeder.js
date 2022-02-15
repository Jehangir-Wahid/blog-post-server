require("../models/Profile");
require("../models/Post");


const mongoose = require("mongoose");
const { faker } = require('@faker-js/faker');

const Profile = mongoose.model("Profile");
const Post = mongoose.model("Post");

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function seedDB() {

    //Set up default mongoose connection
    const mongoDB = "mongodb://127.0.0.1/blogPosts";
    mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

    //Get the default connection
    const db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    // clear table
    db.collection("posts").drop();

    try {

        // create posts
        const authors = await Profile.find().all().lean();

        authors.map(author => {

            for (var i=0; i<5; i++) {

                const sentence = faker.lorem.sentence(10);
                const tags = sentence.split(" ");

                const post = new Post({
                    "authorId": author.authorId,
                    "title": sentence,
                    "content": faker.lorem.lines(3),
                    "post_image": faker.image.image(300, 300, true),
                    "tag": tags[0]
                });

                post.save();
            }
        });

        console.log("created posts");
        console.log("Database seeded! :)");
        process.exit();
    } catch (err) {
        console.log(err.stack);
    }
}

seedDB();