const {
  createCommentCtrl,
  getAllCommentsCtrl,
  deleteCommentsCtrl,
  updateCommentCtrl,
} = require("../controllers/commentsController");
const validateObjectId = require("../middlewares/validateObjectId");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

// /api/comments
router
  .route("/")
  .post(verifyToken, createCommentCtrl)
  .get(verifyTokenAndAdmin, getAllCommentsCtrl);

// /api/comments/:id
router
  .route("/:id")
  .delete(validateObjectId, verifyToken, deleteCommentsCtrl)
  .put(validateObjectId, verifyToken, updateCommentCtrl);

module.exports = router;
