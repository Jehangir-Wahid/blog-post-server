const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

var folderName = "";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        req.folderName = file.fieldname.split("_")[0];
        folderName = req.folderName;
        cb(null, path.join(__dirname, "../../public/images/" + req.folderName));
    },
    filename: (req, file, cb) => {
        req.fileName = uuidv4() + path.extname(file.originalname).toLowerCase();
        cb(null, req.fileName);
    },
});

const upload = multer({
    storage,
    dest: path.join(__dirname, "../../public/images/" + folderName),
    limits: { fileSize: 512000 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|webp|bmp/;
        const mimetype = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname));
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: The file must be a valid image");
    },
});

module.exports = upload;
