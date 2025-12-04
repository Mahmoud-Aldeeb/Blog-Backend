const router = require("express").Router();
const {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  toggleLikeCtrl,
} = require("../controllers/postsController");
const { verifyToken } = require("../middlewares/verifyToken");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/posts
router
  .route("/")
  .post(verifyToken, photoUpload.single("image"), createPostCtrl)
  .get(getAllPostsCtrl);

router.route("/count").get(getPostCountCtrl);

// /api/posts/:id
router
  .route("/:id")
  .get(validateObjectId, getSinglePostCtrl)
  .delete(validateObjectId, verifyToken, deletePostCtrl)
  .put(validateObjectId, verifyToken, updatePostCtrl);

// /api/posts/upload-image/:id
router
  .route("/upload-image/:id")
  .put(
    validateObjectId,
    verifyToken,
    photoUpload.single("image"),
    updatePostImageCtrl
  );

// /api/posts/like/:id
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;
