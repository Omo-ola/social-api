const express = require("express");
const router = express.Router();
const userController = require("../controllers/users");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/:id", userController.getUser);
router.put(
  "/",
  auth,
  upload.single("profilePicture"),
  userController.updateUser
);

module.exports = router;
