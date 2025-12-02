const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validationRegisterUser,
  validationLoginUser,
} = require("../models/User");

/**---------------------------------------------------
 * @desc Register New User
 * @router /api/auth/register
 * @method POST
 * @access public
  -----------------------------------------------------*/

module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validationRegisterUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // is user already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // new user and save it to Db
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();
  // send a response to client
  res.status(201).json({ message: "User created successfully" });
});

/**---------------------------------------------------
 * @desc Login User
 * @router /api/auth/login
 * @method POST
 * @access public
  -----------------------------------------------------*/

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validationLoginUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // is user exist
  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send("User already exists, Invalid email or password");

  // check the password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({ message: "Invalid email or password" });

  // generate token(jwt)
  const token = user.generateAuthToken();

  // send a response to client
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
  });
});
