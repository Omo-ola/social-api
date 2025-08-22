const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const upload = require("../middleware/upload");
const auths = require("../middleware/auth");

router.post(
  "/register",
  upload.single("profilePicture"),
  authController.register
);
router.post("/login", authController.login);
router.get("/me", auths, authController.getMe);

module.exports = router;
