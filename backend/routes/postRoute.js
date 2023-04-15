const express = require("express");
const {
  createPost,
  likePostAndUnlikePost,
  deletePost,
  getPostsOfFollowing,
  updateCaption,
  addComment,
  deleteComment,
} = require("../controllers/postController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, createPost);
router
  .route("/post/:id")
  .get(isAuthenticated, likePostAndUnlikePost)
  .put(isAuthenticated, updateCaption)
  .delete(isAuthenticated, deletePost);

router.route("/posts").get(isAuthenticated, getPostsOfFollowing);
router
  .route("/post/comment/:id")
  .put(isAuthenticated, addComment)
  .delete(isAuthenticated, deleteComment);

module.exports = router;
