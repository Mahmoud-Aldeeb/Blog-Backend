const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlenght: 2,
      maxlenght: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlenght: 5,
      maxlenght: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlenght: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://media.istockphoto.com/id/512830984/photo/icon-man-on-a-white-background-3d-render.jpg?s=612x612&w=is&k=20&c=Gt5zB5VkyrCjJ-G-yBwa-O2mFgDHuUykth9FGnPlv4w=",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate Auth Token
UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET
  );
  return token;
};

const User = mongoose.model("User", UserSchema);

function validationRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(obj);
}
function validationLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(obj);
}

function validationUpdateUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    password: Joi.string().min(8),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validationRegisterUser,
  validationLoginUser,
  validationUpdateUser,
};
