const express = require("express");
const router = express.Router();
const followController = require("../controllers/follows");
const auth = require("../middleware/auth");

router.post("/:userId", auth, followController.followUser);
router.delete("/:userId", auth, followController.unfollowUser);
router.get("/:userId/followers", followController.getFollowers);
router.get("/:userId/following", followController.getFollowing);
router.get("/suggested", auth, followController.getSuggestedUsers);

module.exports = router;
