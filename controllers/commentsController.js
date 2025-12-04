const asyncHandler = require("express-async-handler");
const {
  Comment,
  validationCreateComment,
  validationUpdateComment,
} = require("../models/Comment");
const { User } = require("../models/User");
const { Post } = require("../models/Post");

/**---------------------------------------------------
 * @desc Create New Comment
 * @router /api/comments
 * @method POST
 * @access private (only logged in user)
  -----------------------------------------------------*/

module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validationCreateComment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const profile = await User.findById(req.user._id);

  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user._id,
    username: profile.username,
  });
  res.status(201).json(comment);
});

/**---------------------------------------------------
 * @desc Get All Comments
 * @router /api/comments
 * @method GET
 * @access private (only admin)
  -----------------------------------------------------*/

module.exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user", "-password");
  res.status(200).json(comments);
});

/**---------------------------------------------------
 * @desc Delete Comments
 * @router /api/comments/:id
 * @method DELETE
 * @access private (only admin or owner of the comment)
  -----------------------------------------------------*/

module.exports.deleteCommentsCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.findById(req.params.id);
  if (!comments) return res.status(404).json({ message: "Comment not found" });

  if (req.user.isAdmin || req.user._id == comments.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ message: "Comment deleted successfully", postId: comments._id });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

/**---------------------------------------------------
 * @desc Update Comment
 * @router /api/comments/:id
 * @method PUT
 * @access private (only owner of the comment)
  -----------------------------------------------------*/

module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validationUpdateComment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (req.user._id !== comment.user.toString()) {
    return res
      .status(401)
      .json({ message: "access denied, you are not allowed" });
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        text: req.body.text,
      },
    },
    { new: true }
  );

  res.status(200).json(updatedComment);
});
