import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["student", "educator", "admin"],
    default: "student",
  },
  description: {
    type: String,
    default: "",
    unique: false,
    index: false
  },
  photoUrl: {
    type: String,
    default: "",
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  accountVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
}, { timestamps: true });



// Generate JWT token method
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate refresh token method
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

import { invalidateUserCache } from "../middleware/cacheMiddleware.js";

// Generate reset password token method
userSchema.methods.getResetPasswordToken = function () {
  try {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
  } catch (error) {
    console.error("Error generating reset password token:", error);
    throw new Error("Failed to generate reset password token");
  }
};

// Automated Cache Invalidation Hooks
userSchema.post('save', async function(doc) {
  if (doc) {
    try {
      await invalidateUserCache(doc._id);
    } catch(err) {
       console.error("Redis Cache Invalidation Failed on save:", err);
    }
  }
});

userSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      await invalidateUserCache(doc._id);
    } catch(err) {
       console.error("Redis Cache Invalidation Failed on update:", err);
    }
  }
});

const User = mongoose.model("User", userSchema);
export default User;