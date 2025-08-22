const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likes");
const auth = require("../middleware/auth");

router.post("/:postId", auth, likeController.likePost);
router.delete("/:postId", auth, likeController.unlikePost);
router.get("/:postId", likeController.getPostLikes);

module.exports = router;
