const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search");

router.get("/users", searchController.searchUsers);
router.get("/posts", searchController.searchPosts);
router.get("/", searchController.globalSearch);

module.exports = router;
