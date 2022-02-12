const express = require("express");
const router = express.Router();
const requireAuth = require("../../middlewares/requireAuth");
const upload = require("../../middlewares/imageUpload");
const AuthController = require("../../controllers/AuthController");

router.post("/signup", upload.single("author-avatar"), AuthController.sign_up);

router.post("/signin", AuthController.sign_in);

router.get("/signout", requireAuth, AuthController.sign_out);

router.post("/update-password", requireAuth, AuthController.update_password);

module.exports = router;
