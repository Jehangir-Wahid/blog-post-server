require("../models/User");
require("../models/Profile");

const mongoose = require("mongoose");
const { faker } = require('@faker-js/faker');

const User = mongoose.model("User");
const Profile = mongoose.model("Profile");

async function seedDB() {

    //Set up default mongoose connection
    const mongoDB = "mongodb://127.0.0.1/blogPosts";
    mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

    //Get the default connection
    const db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    // clear tables
    db.collection("users").drop();
    db.collection("profiles").drop();

    try {

        // create users and user profiles
        for (var i=0; i<10; i++){

            const name = faker.name.findName();
            const img = faker.image.avatar();
            const email = faker.internet.email(name);
            const password = "maigey";

            const user = new User({
                "username" : email,
                "password" : password
            });
            user.save();

            const profile = new Profile({
                "authorId" : user._id,
                "name" : name,
                "author_avatar" : img
            });

            profile.save();
        }

        console.log("created users and profiles");
        console.log("Database seeded! :)");
        process.exit();
    } catch (err) {
        console.log(err.stack);
    }
}

seedDB();