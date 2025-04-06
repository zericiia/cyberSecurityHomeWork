const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlenght: 5,
      maxlenght: 100,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlenght: 2,
      maxlenght: 200,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlenght: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// validate update
function validateUpdateUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).email(),
    username: Joi.string().trim().min(2).max(200),
    password: Joi.string().trim().min(6),
    isAdmin: Joi.bool(),
  });
  return schema.validate(obj);
}
// validate Register user
function validateRegisterUser(obj) {
    const schema = Joi.object({
      email: Joi.string().trim().min(5).max(100).required().email(),
      username: Joi.string().trim().min(2).max(200).required(),
      password: Joi.string().trim().min(6).required(),
      isAdmin: Joi.bool(),
    });
    return schema.validate(obj);
  }
// validate Login user
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}
const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  validateRegisterUser,
  validateUpdateUser,
  validateLoginUser,
};
