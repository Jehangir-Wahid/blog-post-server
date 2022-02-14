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
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

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

app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, *"
    );
    next();
});

app.use(bodyParser.json());
app.use(limitRequestesRate);
app.use(express.static(__dirname + "/public"));
app.use("/images", express.static("images"));

app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/post", postRouter);

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

app.listen(process.env.PORT, () => {
    logger.info(`Listening to port ${process.env.PORT}`);
});
