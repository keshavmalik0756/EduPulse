import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/sendToken.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import sendEmail from "../utils/sendEmail.js";
import { generatePasswordResetEmailTemplate } from "../utils/emailTemplates.js";
import { storeOTP, verifyOTP as checkRedisOTP } from "../utils/otpService.js";
import { checkOtpLimit } from "../middleware/rateLimiter.js";
import { getCachedUser, cacheUser } from "../middleware/cacheMiddleware.js";

/* ========================================================
   REGISTER
======================================================== */
export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter all fields.", 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser && existingUser.accountVerified) {
      return next(new ErrorHandler("User already registered with this email.", 400));
    }

    // If user exists but not verified, handle re-registration
    if (existingUser && !existingUser.accountVerified) {
      // Check if too many unverified attempts
      const unverifiedAttempts = await User.countDocuments({
        email: email.toLowerCase(),
        accountVerified: false,
      });

      if (unverifiedAttempts >= 5) {
        return next(
          new ErrorHandler(
            "You have exceeded the number of registration attempts. Please contact support.",
            400
          )
        );
      }

      // Update existing unverified user with new data
      const hashedPassword = await bcrypt.hash(password, 10);

      // Validate role - only allow student or educator
      const validRoles = ["student", "educator"];
      const userRole = validRoles.includes(role) ? role : "student";

      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = userRole;
      await existingUser.save();

      await checkOtpLimit(existingUser.email);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await storeOTP(existingUser.email, otp);

      try {
        await sendVerificationCode({ otp, email: existingUser.email, req });
        return res.status(200).json({
          success: true,
          message: "Registration updated successfully. Please check your email for verification code.",
        });
      } catch (error) {
        return res.status(200).json({
          success: true,
          message: "Registration updated successfully. Please contact support for verification.",
          verificationCode: process.env.NODE_ENV === "development" ? otp : undefined
        });
      }
    }

    // Strong password validation (8–16 chars, 1 uppercase, 1 number, 1 special char)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!passwordRegex.test(password)) {
      return next(
        new ErrorHandler(
          "Password must be 8–16 characters, include 1 uppercase, 1 number, and 1 special character.",
          400
        )
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role - only allow student or educator
    const validRoles = ["student", "educator"];
    const userRole = validRoles.includes(role) ? role : "student";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
    });

    await checkOtpLimit(user.email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await storeOTP(user.email, otp);

    try {
      await sendVerificationCode({ otp, email: user.email, req });
      res.status(200).json({
        success: true,
        message: "User registered successfully. Please check your email for verification code.",
      });
    } catch (error) {
      // Even if email fails, we still want to register the user
      res.status(200).json({
        success: true,
        message: "User registered successfully. Please contact support for verification.",
        verificationCode: process.env.NODE_ENV === "development" ? otp : undefined
      });
    }
  } catch (error) {
    // Handle MongoDB duplicate key error specifically
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyValue)[0];
      return next(new ErrorHandler(`A user with this ${duplicateKey} already exists.`, 400));
    }

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorHandler(message, 400));
    }

    next(error);
  }
});

/* ========================================================
   VERIFY OTP
======================================================== */
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(
      new ErrorHandler("Email or OTP is missing. Please enter all fields.", 400)
    );
  }

  try {
    // First check if user exists at all
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (!existingUser) {
      return next(
        new ErrorHandler("User not found. Please register first.", 404)
      );
    }

    if (existingUser.accountVerified) {
      return next(
        new ErrorHandler("Account already verified. Please login directly.", 400)
      );
    }

    try {
      await checkRedisOTP(email.toLowerCase(), otp.toString());
    } catch (err) {
      return next(new ErrorHandler(err.message || "Invalid or expired OTP", 400));
    }

    // Clean up if there are duplicate unverified entries (from previous flawed schema logic)
    await User.deleteMany({
      _id: { $ne: existingUser._id },
      email: email.toLowerCase(),
      accountVerified: false,
    });

    existingUser.accountVerified = true;
    await existingUser.save({ validateModifiedOnly: true });

    // Use sendToken utility to generate token and send response
    await sendToken(existingUser, 200, res, req);
  } catch (error) {
    return next(
      new ErrorHandler("Internal server error. Please try again.", 500)
    );
  }
});

/* ========================================================
   LOGIN
======================================================== */
export const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    if (!user.accountVerified) {
      return next(new ErrorHandler("Please verify your account first", 401));
    }

    // Check password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Send token and user data
    await sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler("Login failed. Please try again.", 500));
  }
});

/* ========================================================
   LOGOUT
======================================================== */
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,          // REQUIRED for production
      sameSite: "None",      // REQUIRED for Vercel ↔ Render
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

/* ========================================================
   GET USER (ME)
======================================================== */
export const getUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  const cachedUser = await getCachedUser(req.user._id);
  if (cachedUser) {
    return res.status(200).json({
      success: true,
      user: cachedUser,
    });
  }

  const user = await User.findById(req.user._id);
  if (user) await cacheUser(user);

  res.status(200).json({
    success: true,
    user: user || req.user,
  });
});

/* ========================================================
   FORGOT PASSWORD
======================================================== */
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.body.email) {
      return next(new ErrorHandler("Please enter all fields.", 400));
    }

    const user = await User.findOne({
      email: req.body.email,
      accountVerified: true,
    });

    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset password URL
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email with reset password link
    try {
      const message = generatePasswordResetEmailTemplate(resetPasswordUrl);

      await sendEmail({
        email: user.email,
        subject: "EduPulse Password Recovery",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email.",
      });
    } catch (error) {
      console.error("❌ Failed to send password reset email:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorHandler(
          process.env.NODE_ENV === "development"
            ? `Failed to send email: ${error.message}`
            : "Failed to send password reset email. Please try again later.",
          500
        )
      );
    }
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    return next(
      new ErrorHandler(
        "Failed to generate password reset token. Please try again later.",
        500
      )
    );
  }
});

/* ========================================================
   RESET PASSWORD
======================================================== */
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset password token is invalid or expired.", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!passwordRegex.test(req.body.password)) {
    return next(
      new ErrorHandler(
        "Password must be 8–16 characters, include 1 uppercase, 1 number, and 1 special character.",
        400
      )
    );
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save();

  // Use sendToken utility to generate token and send response
  await sendToken(user, 200, res);
});

/* ========================================================
   UPDATE PASSWORD
======================================================== */
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }

  const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current password is incorrect.", 400));
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!passwordRegex.test(newPassword)) {
    return next(
      new ErrorHandler(
        "New password must be 8–16 characters, include 1 uppercase, 1 number, and 1 special character.",
        400
      )
    );
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New Password and Confirm New Password do not match.", 400)
    );
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

/* ========================================================
   RESEND OTP
======================================================== */
export const resendOTP = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }

  try {
    // Find the most recent unverified user with this email
    const user = await User.findOne({
      email: email.toLowerCase(),
      accountVerified: false
    }).sort({ createdAt: -1 });

    if (!user) {
      return next(new ErrorHandler("No pending verification found for this email. Please register again.", 404));
    }

    // Check if user already verified
    const verifiedUser = await User.findOne({ email: email.toLowerCase(), accountVerified: true });
    if (verifiedUser) {
      return next(new ErrorHandler("Account already verified. Please login directly.", 400));
    }

    await checkOtpLimit(user.email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await storeOTP(user.email, otp);

    try {
      await sendVerificationCode({ otp, email: user.email, req });
      res.status(200).json({
        success: true,
        message: "Verification code resent successfully. Please check your email.",
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        message: "Verification code generated. Please contact support if you don't receive the email.",
        verificationCode: process.env.NODE_ENV === "development" ? otp : undefined
      });
    }
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return next(new ErrorHandler("Failed to resend verification code. Please try again.", 500));
  }
});

/* ========================================================
   REFRESH TOKEN
======================================================== */
export const refreshToken = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorHandler("Refresh token is required", 400));
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Generate new access token
    const accessToken = user.generateToken();

    res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        description: user.description
      }
    });
  } catch (error) {
    return next(new ErrorHandler("Invalid refresh token", 401));
  }
});
