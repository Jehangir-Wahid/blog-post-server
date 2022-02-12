require("./models/User");
require("./models/Profile");
require("./models/Post");
require("./models/Fan");
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./helpers/logger";
import limitRequestesRate from "./middlewares/limitRequestsRate";
import authRouter from "./routes/authRoutes";
import authorRouter from "./routes/authorRoutes";
import postRouter from "./routes/postRoutes";
import fanRouter from "./routes/fanRoutes";
import bodyParser from "body-parser";

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
