const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validationCreatePost,
  validationUpdatePost,
} = require("../models/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");

/**---------------------------------------------------
 * @desc Create New Post
 * @router /api/posts
 * @method Post
 * @access private (only logged in user)
  -----------------------------------------------------*/

module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // 1. validation for image
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // 2. validation for data
  const { error } = validationCreatePost(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // 3. upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  // 4. create new post and save it to DB
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
    user: req.user._id,
    category: req.body.category,
  });
  // 5. send response to client
  res.status(201).json(post);

  // 6. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**---------------------------------------------------
 * @desc Get All Posts
 * @router /api/posts
 * @method GET
 * @access public 
  -----------------------------------------------------*/

module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 6;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", "-password");
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", "-password");
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "-password");
    console.log(posts);
  }

  res.status(200).json(posts);
});

/**---------------------------------------------------
 * @desc Get Single Post
 * @router /api/posts/:id
 * @method GET
 * @access public 
  -----------------------------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", "-password")
    .populate("comments");
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.status(200).json(post);
});

/**---------------------------------------------------
 * @desc Get Post Count
 * @router /api/posts/count
 * @method GET
 * @access public 
  -----------------------------------------------------*/
module.exports.getPostCountCtrl = asyncHandler(async (req, res) => {
  const post = await Post.countDocuments();
  res.status(200).json(post);
});

/**---------------------------------------------------
 * @desc Delete Post 
 * @router /api/posts/:id
 * @method Delete
 * @access private (only admin or owner of the post)
  -----------------------------------------------------*/

module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (req.user.isAdmin || req.user._id == post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    // @TODO - Delete all comments that belong to this post
    await Comment.deleteMany({ postId: post._id });

    res
      .status(200)
      .json({ message: "Post deleted successfully", postId: post._id });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

/**---------------------------------------------------
 * @desc Update Post 
 * @router /api/posts/:id
 * @method PUT
 * @access private (only owner of the post)
  -----------------------------------------------------*/

module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  // 1.validation
  const { error } = validationUpdatePost(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 2. get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  // 3. check if the user is the owner of the post
  if (req.user._id !== post.user.toString())
    return res
      .status(401)
      .json({ message: "access denied, you are not allowed" });

  // 4. update the post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", "-password");

  // 5. send response to client
  res.status(200).json(updatedPost);
  // res.status(200).json({ message: "Post updated successfully", updatedPost });
});

/**---------------------------------------------------
 * @desc Update Post Image
 * @router /api/posts/upload-image/:id
 * @method PUT
 * @access private (only owner of the post)
  -----------------------------------------------------*/

module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
  // 1.validation
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // 2. get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  // 3. check if the user is the owner of the post
  if (req.user._id !== post.user.toString())
    return res
      .status(401)
      .json({ message: "access denied, you are not allowed" });

  // 4. delete the post Image
  await cloudinaryRemoveImage(post.image.publicId);

  // 5. upload new image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 6. update the image field in the db
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // 7. send response to client
  res.status(200).json(updatedPost);
  // 8. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**---------------------------------------------------
 * @desc Toggle Like  
 * @router /api/posts/like/:id
 * @method PUT
 * @access private (only owner of the post)
  -----------------------------------------------------*/

module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user._id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});
