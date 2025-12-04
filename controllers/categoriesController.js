const asyncHandler = require("express-async-handler");
const { Category, validationCreateCategory } = require("../models/Category");

/**---------------------------------------------------
 * @desc Create New Category
 * @router /api/categories
 * @method POST
 * @access private (only admin)
  -----------------------------------------------------*/

module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
  const { error } = validationCreateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.create({
    title: req.body.title,
    user: req.user._id,
  });
  res.status(201).json(category);
});

/**---------------------------------------------------
 * @desc Get All Category
 * @router /api/categories
 * @method GET
 * @access public
  -----------------------------------------------------*/

module.exports.getAllCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await Category.find();
  res.status(200).json(category);
});

/**---------------------------------------------------
 * @desc Delete  Category
 * @router /api/categories/:id
 * @method Delete
 * @access private (only admin)
  -----------------------------------------------------*/

module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  await Category.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .json({
      message: "Category deleted successfully",
      categoryId: category._id,
    });
});
