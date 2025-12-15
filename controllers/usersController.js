const asyncHandler = require("express-async-handler");
const { User, validationUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const { cloudinaryRemoveMultipleImage } = require("../utils/cloudinary");

/**---------------------------------------------------
 * @desc Get All Users Profile
 * @router /api/users/profile
 * @method GET
 * @access private (only admin)
  -----------------------------------------------------*/

module.exports.getAllUsersProfileCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

/**---------------------------------------------------
 * @desc Get User Profile
 * @router /api/users/profile/:id
 * @method GET
 * @access public
  -----------------------------------------------------*/

module.exports.getUsersProfileCtrl = asyncHandler(async (req, res) => {
  const users = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!users) return res.status(404).json({ message: "User not found" });

  res.status(200).json(users);
});

/**---------------------------------------------------
 * @desc Update User Profile
 * @router /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
  -----------------------------------------------------*/

module.exports.updateUsersProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validationUpdateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  )
    .select("-password")
    .populate("posts");
  res.status(200).json(updateUser);
});

/**---------------------------------------------------
 * @desc Get Count Users
 * @router /api/users/count
 * @method GET
 * @access private (only admin)
  -----------------------------------------------------*/

module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const users = await User.countDocuments();
  res.status(200).json(users);
});

/**---------------------------------------------------
 * @desc Profile Photo Upload
 * @router /api/users/profile/profile-photo-upload
 * @method Post
 * @access private (only logged in user)
  -----------------------------------------------------*/

module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  // 2. Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // 3. Upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);
  console.log("result", result);

  // 4. Get the user from DB
  const user = await User.findById(req.user._id);
  console.log("user", user);
  // 5. Delete the old profile photo if exist
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.public_id);
  }

  // 6. Change the profilePhoto field in the DB
  user.profilePhoto = {
    public_id: result.public_id,
    url: result.secure_url,
  };
  await user.save();

  // 7. Send response to client
  res.status(200).json({
    message: "File uploaded successfully",
    profilePhoto: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });
  // 8. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**---------------------------------------------------
 * @desc Delete User Profile (Account)
 * @router /api/users/profile/:id
 * @method Delete
 * @access private (only user himself or admin)
  -----------------------------------------------------*/

module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  // 1. Get the user from DB
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // 2. Get all posts from DB @TODO
  const posts = await Post.find({ user: user._id });

  // 3. Get the public ids from posts @TODO
  const publicIds = posts?.map((post) => post.image.publicId);
  // 4. Delete all posts image from cloudinary that belong to this user @TODO
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  // 5. Delete the profile picture from cloudinary
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // 6. Delete user posts & comments @TODO
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  // 7. Delete the user himself
  await User.findByIdAndDelete(req.params.id);

  // 8. Send a response to the client
  res.status(200).json({ message: "User deleted successfully" });
});
