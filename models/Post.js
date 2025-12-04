const mongoose = require("mongoose");
const Joi = require("joi");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlenght: 2,
      maxlenght: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlenght: 10,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate Comment For this Post
PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

const Post = mongoose.model("Post", PostSchema);

function validationCreatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().min(10).required(),
    category: Joi.string().required(),
  });
  return schema.validate(obj);
}

function validationUpdatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().min(10),
    category: Joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  Post,
  validationCreatePost,
  validationUpdatePost,
};
