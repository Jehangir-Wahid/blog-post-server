require("./models/User");
require("./models/Profile");
require("./models/Post");
require("./models/Fan");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./helpers/logger");
const limitRequestesRate = require("./middlewares/limitRequestsRate");
const authRouter = require("./routes/authRoutes");
const authorRouter = require("./routes/authorRoutes");
const postRouter = require("./routes/postRoutes");
const fanRouter = require("./routes/fanRoutes");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

app.use(bodyParser.json());
app.use(limitRequestesRate);
app.use(express.static(__dirname + "/public/images"));
app.use("/public/images", express.static("images"));

app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/post", postRouter);
app.use("/fan", fanRouter);

const mongoDb = process.env.CONNECTION_STRING;
mongoose.connect(mongoDb, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    logger.info("connected to mongodb instance");
});

mongoose.connection.on("error", (err) => {
    logger.error("Error connecting to mongo");
});

app.get("/", (req, res) => {
    res.send("Welcome");
});

app.listen(process.env.SERVER_PORT, () => {
    logger.info(`Listening to port ${process.env.SERVER_PORT}`);
});
