const router = require("express").Router();
const {
  createCategoryCtrl,
  getAllCategoryCtrl,
  deleteCategoryCtrl,
} = require("../controllers/categoriesController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
// /api/categories
router
  .route("/")
  .post(verifyTokenAndAdmin, createCategoryCtrl)
  .get(getAllCategoryCtrl);

router
  .route("/:id")
  .delete(validateObjectId, verifyTokenAndAdmin, deleteCategoryCtrl);

module.exports = router;
