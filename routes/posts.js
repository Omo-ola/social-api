const express = require("express");
const router = express.Router();
const postController = require("../controllers/posts");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/", auth, upload.single("media"), postController.createPost);
router.get("/feed", auth, postController.getFeed);
router.get("/:id", postController.getPost);
router.get("/user/:userId", postController.getUserPosts);
router.delete("/:id", auth, postController.deletePost);

module.exports = router;
