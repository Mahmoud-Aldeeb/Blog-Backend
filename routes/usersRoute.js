const router = require("express").Router();
const {
  getAllUsersProfileCtrl,
  getUsersProfileCtrl,
  updateUsersProfileCtrl,
  getUsersCountCtrl,
  profilePhotoUploadCtrl,
  deleteUserProfileCtrl,
} = require("../controllers/usersController");
const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");

// /api/users/profile/
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersProfileCtrl);

// /api/users/profile/:id
router.route("/profile/:id").get(validateObjectId, getUsersProfileCtrl);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .put(validateObjectId, verifyTokenAndOnlyUser, updateUsersProfileCtrl)
  .delete(validateObjectId, verifyTokenAndAuthorization, deleteUserProfileCtrl);

// /api/users/profile/profile-photo-upload

router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl);

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

module.exports = router;
